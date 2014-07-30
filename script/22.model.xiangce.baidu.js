
models.register({
	name : '百度相册',
	ICON : 'http://xiangce.baidu.com/favicon.ico',
	BOOKMARK_URI : 'http://xiangce.baidu.com/bookmark',
	UPLOAD_URI : 'http://up.xiangce.baidu.com/bookmark/submit',
	check : function(ps){
		return (ps.type == 'photo');
	},
	getid : function(ps) {
			var data = {};
			var target = getPref("target.xiangce.baidu");
			if(!target) {
				target = prompt("Input folder id for xiangce.baidu.com:");
				setPref("target.xiangce.baidu",target);
			}
			data.target = target;
			/*
			URL=http://xiangce.baidu.com/bookmark?tpl=v3&name=èæ³½å°æè¶£åè¡£ å¤å¥³å£«é«æ¡£è¯±æè¾ä¸éæè¯±ææ§æç¡è¡£ç¡è£å¥è£80547 é»è²80547 XLãå¾ç ä»·æ ¼ åç æ¥ä»·ã-äº¬ä¸&surl=http://item.jd.com/1015837826.html
			*/
			var self = this;

			return request(
				self.BOOKMARK_URI,
				{
					referrer: ps.pageUrl,
					queryString:	{
						tpl:	'v3',
						name:	ps.item,
						surl:	ps.pageUrl
					}
				}
			).addCallback(function(res) {
				var t = res.responseText;
				var m = t.match(/"bdstoken":"([^"]+)"/);
				if(m) {
					data.bdstoken = m[1];
				}
				if(!data.target) {
					m = t.match(/"album_sign":"([^"]+)"/);
					if(m) {
						data.target = m[1];
						setPref("target.xiangce.baidu",data.target);
					}
				}
				return data;
			});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		var self = this;
		modelExt.assertFalse(ps,{'adult':true,'private':true});
		var tags= (ps.tags && ps.tags.length)>0 ? "" + joinText(ps.tags, ', ') + "" : ''; 
		
		//URL=http://up.xiangce.baidu.com/bookmark/submit

		/*
picture_name=Desc
picture_src_list%5B%5D=http://img30.360buyimg.com/popWaterMark/g15/M09/03/1C/rBEhWlIEpiYIAAAAAAL5ji4KdxYAAB5DQBv0JcAAvmm747.jpg
bdstoken=2a8c2029492a1e00
surl=http://item.jd.com/1015837826.html
album_sign=53bb912607e01de97f9beb2d9f07b4bd593fe39b
scope=0
		*/
		
		if(!ps.type == 'photo') {
			throw new Error("No support post type: " + ps.type);
		}
		return this.getid(ps).addCallback(function(data){
			var actionUrl = self.UPLOAD_URI;
			var SC = {
							picture_name			: tags || (new Date()).toJSON(),
							'picture_src_list[]'	: ps.itemUrl,
							bdstoken				: data.bdstoken,
							surl					: ps.pageUrl,
							album_sign				: data.target,
							scope					: 0,	
			};
			return request(actionUrl,{
				referrer	: ps.pageUrl,
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
		});
	},
	
});
