
models.register({
	name : '人人网',

	ICON : 'http://s.xnimg.cn/favicon-rr.ico?ver=$revxxx$',
	SHARE_API : 'http://widget.renren.com/dialog/',///v2?tmp=' + (+new Date);
	
	check : function(ps){
		return (/(photo|link)/).test(ps.type);
	},
	share : function(ps,newTab) {
		var apiurl = this.SHARE_API + 'share';
//		URL=http://widget.renren.com/dialog/share?resourceUrl=http%3A%2F%2Fhuaban.com%2Fpins%2F25738006%2F&title=%20%E2%99%A5%E5%88%86%E4%BA%AB%E8%87%AA%40%E8%8A%B1%E7%93%A3%E7%BD%91%20%E7%9A%84%E7%94%BB%E6%9D%BF%23%E6%A3%9A%E6%8B%8D%E6%A0%B7%E5%9B%BE%E9%87%87%E9%9B%86%E7%AB%99%23%20%C2%BB&pic=http%3A%2F%2Fimg.hb.aicdn.com%2F2c5ad6e37eeb02d90f926f950b9e9aa2130f606cbea7-WHqkVg_fw554
//		URL=http://widget.renren.com/dialog/share?resourceUrl=http://share.baidu.com/code/picshare#0-renren-1-54879-98fde57bb3d39343db0f272b38411f3e&srcUrl=http://share.baidu.com/code/picshare#0-renren-1-54879-98fde57bb3d39343db0f272b38411f3e&title=å¾çåäº«-ç¾åº¦åäº«&description=&pic=http://news.share.baidu.com/static/web/img/imgshare/preview_img_small.jpg?v=e0f4900b.jpg
		var CT = {
			title		: ps.item,
			srcUrl		: ps.pageUrl,
			resourceUrl	: ps.itemUrl,
			description	: ps.description + ((ps.tags && ps.tags.length) ? "\n " + xUtils.toTagText(ps.tags) : ""),
		}
		if(ps.type == 'photo') {
			update(CT,{
				pic			: ps.itemUrl,
				resourceUrl	: ps.pageUrl,
				link		: ps.pageUrl,
				image_src	: ps.itemUrl,
				medium		: 'image',
			});
		}
		var params = [];
		for(i in CT) {
			params.push(i + '=' + CT[i]);
		}
		var url = apiurl + '?' + joinText(params,'&');
		ps.referrer = url;
		if(!newTab) {
			return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				sendContent : CT,
			});
		}
		else {
			return addTab(url);
		}
	},
	upload : function(ps) {
		var self = this;
		return this.share(ps).addCallback(function(res) {
			var doc = convertToHTMLDocument(res.responseText);
			var form = formContents(doc);
			return form;
		});
	},
	queue : function(data,ps) {
/*	
 *	URL=http://widget.renren.com/dialog/share/share
 *
	sign=1350908372772_cbc3fd78903870bb1d5684c9ffe76e4d
	captcha_type=openplatform
	key_id=openplatform
	domain=renren.com
	origURL=http://widget.renren.com/dialog/share/dfln
	api_key=
	srcUrl=http%3A%2F%2Fhuaban.com%2Fpins%2F25738006%2F
	resUrlMd5=f74133455b98f5f0628369c6332dc422
	resourceUrl=http%3A%2F%2Fhuaban.com%2Fpins%2F25738006%2F
	charset=
	medium=link
	meta=
	type=6
	fromParse=true
	shareVersion=v1
	pic=http://img.hb.aicdn.com/2c5ad6e37eeb02d90f926f950b9e9aa2130f606cbea7-WHqkVg_fw554
	from=
	shareAction=selfsh
	message=comments
	title= â¥åäº«èª@è±ç£ç½ çç»æ¿#æ£ææ ·å¾ééç«# Â»
	description=é©å­å¥-æå½±å¸ééå°æ£ææ ·å¾ééç« - è±ç£
	user_id=473253755
	email=
	password=
	icode=

*/
		if(data) {
			var actionUrl = this.SHARE_API + 'share/share';
			var CT = update(data,{
				shareAction : 'selfsh',//((ps.adult||ps.private) ? 'selfsh' : 'allsh'),
			});
			if(ps.type == 'link') {
			}
			else if(ps.type == 'photo') {
				update(CT, {
					pic			: ps.itemUrl,
					resourceUrl	: ps.pageUrl,
					link		: ps.pageUrl,
					image_src	: ps.itemUrl,
					medium		: 'image',
				});
			}
			return request(actionUrl,{
				referrer	: ps.referrer || self.SHARE_API,
				headers		: {
					'X-Requested-With' : 'XMLHttpRequest',
				},
                sendContent : CT,
			});
		}
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'tumblr-file');
		var self = this;
		return this.upload(ps).addCallback(function(data) {
			if(data) {
				return self.queue(data,ps).addCallback(function(res) {self.checkPost(res,ps);});
			}
			else {
				throw new Error('Sharing failed.');
			}
		});
	},
	checkPost : function(res,ps) {
		var r = res.responseText;
		var self = this;
		if(r.match(/<div class="success">/)) {
			return succeed(res);
		}
		else if(ps.quiet) {
			throw new Error("Post failed.");
		}
		else {
			self.share(ps,1);
			throw new Error("Post failed.");
		}
	},
});
