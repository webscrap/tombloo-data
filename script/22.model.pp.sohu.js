
models.register({
	name : '搜狐相册',
	ICON : 'http://pp.sohu.com/favicon.ico',
	UPLOAD_URI : 'http://pp.sohu.com/upload/remote',
	check : function(ps){
		return (ps.type == 'photo');
	},
	getid : function(ps) {
			var target = getPref("target.pp.sohu");
			if(!target) {
				target = prompt("Input folder id for pp.sohu.com:");
				setPref("target.pp.sohu",target);
			}
			if(target) {
				return {id:target};
			}
			else {
					throw new Error("No folder id specified.");
			}
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		var self = this;
		//modelExt.assertFalse(ps,{'adult':true,'private':true});
		var tags= ps.tags && ps.tags.length>0 ? "[#" + joinText(ps.tags, '#, #') + "#]" : ''; 
		
		//URL=http://pp.sohu.com/upload/remote
		//Content-Type=application/x-www-form-urlencoded; charset=UTF-8
		//X-Requested-With=XMLHttpRequest

		/*
		referer=http://www.moko.cc/post/493098.html
		folder_id=
		url=http://img1.moko.cc/users/0/26/7902/post/c9/img1_src_3545937.jpg
		*/
		
		if(!ps.type == 'photo') {
			throw new Error("No support post type: " + ps.type);
		}
		var data = this.getid(ps);

		var actionUrl = self.UPLOAD_URI;
		var SC = {
						folder_id	: data.id,
						referer		: ps.pageUrl,
						url			: ps.itemUrl,
						desc		: joinText([ps.item,ps.description,tags],"\n"),		
		};
		var HD = {
			'X-Requested-With' : 'XMLHttpRequest',
			'Content-Type'	 	: 'application/x-www-form-urlencoded; charset=UTF-8',
		};
		return request(actionUrl,{
			referrer	: ps.pageUrl,
			headers		: HD,
			sendContent	: SC,
		}).addCallback(function(res){
			var r = res.responseText;
			var m = r.match(/"msg": "([^"]+)"/);
			if(m) {
				if(m[1] == "success uploaded") {
				}
				else {
					throw new Error("Post error [" + m[1] + "]");
				}
			}
		});
	},
	
});
