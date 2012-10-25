
modelExt.hookModel('GoogleBookmarks','firefox','link|photo|video|text');

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


models.Tumblr.post = function(oldps){
	var self = this;
	var ps = modelExt.createPost(oldps,'tumblr+video');
	var endpoint = Tumblr.TUMBLR_URL + 'new/' + ps.type;
	return this.postForm(function(){
		return self.getForm(endpoint).addCallback(function(form){
			var frm = Tumblr[ps.type.capitalize()].convertToForm(ps);
			frm['post[source_url]'] = ps.pageUrl;
			update(form, frm);
			self.appendTags(form, ps);
			return request(endpoint, {sendContent : form});
		});
	});
};

addBefore(Tumblr, 'appendTags', function(form, ps){
	if(ps.type != 'regular')
		form['post[state]'] = 2;
});


update(models.WeHeartIt,{
	URL   : 'https://weheartit.com/',
	check : function(ps){
		return ps.type.match(/photo|quote/)  && !ps.file;
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

update(models.FirefoxBookmark,{
	check	: function(ps) {
		return ps.type.match(/photo|quote|link|video|regular/);
	},
	post	: function(oldps) {
		if(oldps.type == 'photo') {
			var ps = modelExt.createPost(oldps,'links');
			for(var i=0;i<ps.tags.length;i++) {
				if(ps.tags[i] == 'photolink') {
					ps.tags[i] = 'linkphoto';
				}
			}
			ps.type = 'link';
			this.addBookmark(ps.itemUrl, ps.item, ps.tags, ps.description);
		}
		var ps = modelExt.createPost(oldps,'firefox');
		return succeed(this.addBookmark(ps.itemUrl, ps.item, ps.tags, ps.description));
	},
});
['Readability','Instapaper'].forEach(function(name,idx) {
	modelExt.hookModel(name,'links',/photo|quote|link|video|regular/);
});
