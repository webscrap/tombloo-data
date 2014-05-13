
update(models.GoogleBookmarks, {
	POST_URL : 'https://www.google.com.hk/bookmarks/mark',
	
	check : function(ps){
		return (/(photo|quote|link|conversation|video|text)/).test(ps.type) && !ps.file;
	},
	
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'firefox');
		return request(this.POST_URL, {
			queryString : {
				op     : 'edit',
				output : 'popup',
			},
		}).addCallback(function(res){
			var doc = convertToHTMLDocument(res.responseText);
			if(doc.getElementById('gaia_loginform'))
				throw new Error(getMessage('error.notLoggedin'));
			
			return request('https://www.google.com.hk' + $x('//form[@name="add_bkmk_form"]/@action', doc), {
				redirectionLimit : 0,
				sendContent : update(formContents(doc), {
					title      : ps.item,
					bkmk       : ps.itemUrl,
					annotation : joinText([ps.body, ps.description], ' ', true),
					labels     : joinText(ps.tags, ','),
				}),
			});
		});
	},
});

if(models.Twitpic) {
	models.Twitpic.ICON = 'https://twitpic.com/favicon.ico';
	models.Twitpic.POST_URL = 'https://twitpic.com/upload';
	modelExt.hookModel('Twitpic','weheartit');
}

modelExt.hookModel('Twitter','weibo');



update(models.StumbleUpon, {
	check	: function(ps) {
		if(ps.type == 'photo' || ps.type == 'link') {
			return true;
		}
	}
});



update(models.WeHeartIt,{
	URL   : 'https://weheartit.com/',
	check : function(ps){
		return ps.type && ps.type.match(/photo|quote/)  && !ps.file;
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
		if(!this.getAuthCookie())
			return fail(new Error(getMessage('error.notLoggedin')));
		return request(this.URL + 'create_entry/', {
			redirectionLimit : 0,
			referrer : ps.pageUrl,
			queryString : {
				via   : ps.pageUrl,
				title : ps.item,
				media   : ps.itemUrl,
                tags : joinText(ps.tags, ','),
			},
        });
	},
	getAuthCookie : function(){
        //return 1;
		// ¥¯¥Ã¥­©`¤ÎÓ×÷¤¬²»°²¶¨¤Ê¤¿¤á2¤Ä¤ò¥Á¥§¥Ã¥¯¤·ÕæÎ¤ò·µ¤¹
		return getCookieString('weheartit.com', 'auth');
	},
});


['Readability','Instapaper'].forEach(function(name,idx) {
	modelExt.hookModel(name,'links',/photo|quote|link|video|regular/);
});

['HatenaBookmark'].forEach(function(name,idx){
	modelExt.hookModel(name,'firefox',/photo|quote|link|video|regular/);
});

update(models.Flickr,{
	API_KEY : 'e19f9a2b425faaad9b68e4078e487251',
	check : function(ps){
		return ps.type == 'photo';
	},
	
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		ps.description = '' 
			+   'Title : ' + ps.item 
			+ '\nImage : '  + ps.itemUrl
			+ '\nSource: ' + ps.pageUrl 
			+ '\nTags  : ' + joinText(ps.tags,', ')	
			+ '\n\n' + ps.description;
		return (ps.file? succeed(ps.file) : download(ps.itemUrl, getTempFile())).addCallback(function(file){
			return models.Flickr.upload({
				photo       : file,
				title       : ps.item || ps.page || '',
				description : ps.description || '',
				is_public   : 0,//((ps.private || ps.adult) ? 0 : 1),
				tags        : joinText(ps.tags, ' '),
			});
		});
	},

	callMethod : function(ps){
		return request('https://www.flickr.com/services/rest/', {
			queryString : update({
				api_key        : this.API_KEY,
				nojsoncallback : 1,
				format         : 'json',
			}, ps),
		}).addCallback(function(res){
			eval('var json=' + res.responseText);
			if(json.stat!='ok')
				throw json.message;
			return json;
		});
	},
	
	callAuthMethod : function(ps){
		return this.getToken().addCallback(function(page){
			if(ps.method=='flickr.photos.upload')
				delete ps.method;
			
			update(ps, page.token);
			ps.cb = new Date().getTime(),
			ps.api_sig = (page.secret + keys(ps).sort().filter(function(key){
				// ファイルを取り除く
				return typeof(ps[key])!='object';
			}).map(function(key){
				return key + ps[key]
			}).join('')).md5();
			
			return request('https://www.flickr.com/services/' + (ps.method? 'rest/' : 'upload/'), {
				sendContent : ps,
			});
		}).addCallback(function(res){
			res = convertToDOM(res.responseText);
			if(res.querySelector('[stat]').getAttribute('stat')!='ok'){
				var errElem = res.querySelector('err');
				var err = new Error(errElem.getAttribute('msg'))
				err.code = errElem.getAttribute('code');
				
				throw err;
			}
			return res;
		});
	},
	
	getToken : function(){
		var status = this.updateSession();
		switch (status){
		case 'none':
			throw new Error(getMessage('error.notLoggedin'));
			
		case 'same':
			if(this.token)
				return succeed(this.token);
			
		case 'changed':
			var self = this;
			return request('https://www.flickr.com/').addCallback(function(res){
				var html = res.responseText;
				return self.token = {
					secret : html.extract(/"secret"[ :]+"(.*?)"/),
					token  : {
						api_key    : html.extract(/"api_key"[ :]+"(.*?)"/),
						auth_hash  : html.extract(/"auth_hash"[ :]+"(.*?)"/),
						auth_token : html.extract(/"auth_token"[ :]+"(.*?)"/),
					},
				};
			});
		}
	},
});