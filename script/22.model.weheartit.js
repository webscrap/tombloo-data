models.register({
	name : 'WeHeartIt',
	ICON : 'http://weheartit.com/favicon.ico',	
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
				set:	getPref("target.huaban"),
			},
        });
	},
	getAuthCookie : function(){
        //return 1;
		// £¤¡¥£¤?£¤-?`¡è??¨®¡Á¡Â¡è?2?¡ã2?¡§¡è¨º¡è?¡è¨¢2¡è?¡è¨°£¤¨¢£¤¡ì£¤?£¤¡¥¡è¡¤??????¡è¨°¡¤¦Ì¡è1
		return getCookieString('weheartit.com', 'auth');
	},
	
	favor : function(ps){
		return this.iHeartIt(ps.favorite.id);
	},
	
	iHeartIt : function(id){
		if(!this.getAuthCookie())
			return fail(new Error(getMessage('error.notLoggedin')));
		
		return request(this.URL + 'inc_heartedby.php', {
			redirectionLimit : 0,
			referrer : this.URL,
			queryString : {
				do    : 'heart',
				entry : id,
			},
		});
	},

});
		