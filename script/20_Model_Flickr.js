if(typeof(models)=='undefined')
	this.models = models = new Repository();
// Flickr API Documentation 
// http://www.flickr.com/services/api/
models.register(update({
	name : 'Flickr',
	ICON : 'http://www.flickr.com/favicon.ico',
	API_KEY : 'ecf21e55123e4b31afa8dd344def5cc5',
	
	check : function(ps){
		return ps.type == 'photo';
	},
	
	post : function(ps){
		models.pre_post(ps);
		var tags = joinText(ps.tags, ' ');
		var desc = ps.description || '';
		if(tags.match(/reupload/)) {
			desc = 'src{' + ps.itemUrl + '}\npage{' + ps.pageUrl + '}\ntitle{' + ps.item + '}';
		}
		return (ps.file? succeed(ps.file) : download(ps.itemUrl, getTempFile())).addCallback(function(file){
			return models.Flickr.upload({
				photo       : file,
				title       : ps.item || ps.page || '',
				description : desc,
				is_public   : ps.private? 0 : 1,
				tags        : tags,
			});
		});
	},
	
	favor : function(ps){
		return this.addFavorite(ps.favorite.id);
	},
	
	callMethod : function(ps){
		return request('http://flickr.com/services/rest/', {
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
			
			return request('http://flickr.com/services/' + (ps.method? 'rest/' : 'upload/'), {
				sendContent : ps,
			});
		}).addCallback(function(res){
			res = convertToXML(res.responseText);
			if(res.@stat!='ok'){
				var err = new Error(''+res.err.@msg)
				err.code = res.err.@code;
				
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
			return request('http://flickr.com/').addCallback(function(res){
				var html = res.responseText;
				return self.token = {
					secret : html.extract(/global_flickr_secret[ =]+'(.*?)'/),
					token  : {
						api_key    : html.extract(/global_magisterLudi[ =]+'(.*?)'/),
						auth_hash  : html.extract(/global_auth_hash[ =]+'(.*?)'/),
						auth_token : html.extract(/global_auth_token[ =]+'(.*?)'/),
					},
				};
			});
		}
	},
	
	addFavorite : function(id){
		return this.callAuthMethod({
			method   : 'flickr.favorites.add',
			photo_id : id,
		}).addErrback(function(err){
			switch(err.message){
			case 'Photo is already in favorites': // code = 3
				return;
			}
			
			throw err;
		});
	},
	
	removeFavorite : function(id){
		return this.callAuthMethod({
			method   : 'flickr.favorites.remove',
			photo_id : id,
		});
	},
	
	getSizes : function(id){
		return this.callMethod({
			method   : 'flickr.photos.getSizes',
			photo_id : id,
		}).addCallback(function(res){
			return res.sizes.size;
		});
	},
	
	getInfo : function(id){
		return this.callMethod({
			method   : 'flickr.photos.getInfo',
			photo_id : id,
		}).addCallback(function(res){
			return res.photo;
		});
	},
	
	// photo
	// title (optional)
	// description (optional)
	// tags (optional)
	// is_public, is_friend, is_family (optional)
	// safety_level (optional)
	// content_type (optional)
	// hidden (optional)
	upload : function(ps){
		return this.callAuthMethod(update({
			method   : 'flickr.photos.upload',
		}, ps)).addCallback(function(res){
			return ''+res.photoid;
		});
	},
	
	getAuthCookie : function(){
		return getCookieString('flickr.com', 'cookie_accid');
	},
}, AbstractSessionService));