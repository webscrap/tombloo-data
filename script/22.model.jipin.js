
models.register({
	name : '开心集品',
	ICON : 'http://jipin.kaixin001.com/favicon.ico',
	SHARE_API : 'http://apitu.jipin.kaixin001.com/',
	check : function(ps){
		return ps.type == "photo" && (!ps.file);
	},
	getAlbum : function(referrer,ps) {
		//
		//URL=http://apitu.jipin.kaixin001.com/user/me/albums
		var id;// = getPref('jipin.id');
		if(id) {
			return succeed({id:id});
		}
		var aname = getPref('target.jipin');
		var self = this;
		var apiurl = this.SHARE_API + 'user/me/albums';
		return request(apiurl,{
			referrer	: referrer || self.SHARE_API,
		}).addCallback(function(res) {
			self.checkPost(res,ps);
			var albums = JSON.parse(res.responseText);
			if(albums && albums.list) {
				if(aname) {
					for(var i=0;i<albums.list.length;i++) {
						if(albums.list[i].title.match(aname)) {
							return {id:albums.list[i].aid};
						}
					}
				}
				return {id:albums.list[0].aid};
			}
			else {
				throw new Error('Cound not detect album to post:' + "\n" + getMessage('error.notLoggedin'));
			}
		});
	},
	post :	function(oldps) {
		var self = this;
		var apiurl = self.SHARE_API + 'pin/new';
		var referrer	= self.SHARE_API + '/remote/remote?xdm_e=' + oldps.pageUrl + '&xdm_c=default8789&xdm_p=1';
		var ps = modelExt.createPost(oldps,"weheartit");
//		modelExt.throwPost(ps, ["adult","private"]);
		if(ps.type != 'photo') {
			throw new Error(ps.type + ' is not supported.');
		}
		var desc = ps.item;
		if(ps.description) desc += "\n\n" + ps.description;
		//if(ps.tags)	desc += "\n\n" + xUtils.toWeiboText(ps.tags);
		return self.getAlbum(referrer,ps).addCallback(function(album){
			return request(apiurl, {
				referrer	: referrer,
				sendContent	: {
					aid		: album.id,
					desc	: desc,
					url		: ps.pageUrl,
					siteids : '[]',
					price	: '',
					image_infos	: JSON.stringify([{src:ps.itemUrl,title:ps.item,alt:''}]),
					label	: joinText(ps.tags,'+'),
				},
			}).addCallback(function(res) {self.checkPost(res,ps)});
		});
/*
aid=1414108030880652
desc=æ·å¥³é - æ¥åå¸ - çæ
url=http://mm.taobao.com/activity/mm_apply_detail.htm?activity_id=77008&apply_id=688260260
image_infos=[{"src":"http://img01.taobaocdn.com/sns_album/i1/T1bnicXeJsXXb1upjX.jpg","title":"","alt":""}]
siteids=["1","2","4"]
price=
*/
			
	},
	checkPost : function(res,ps) {
		var t = res.responseText;
		if(!t) {
			return;
		}
		var m = t.match(/"errno":\d+\s*,\s*"error":"([^"]+)/);
		if(m) {
			throw new Error("Post failed: " + m[1]);
		}
		return;
	},
});
