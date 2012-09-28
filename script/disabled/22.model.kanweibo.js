models.register({
	name	: '微刊',
	ICON	: 'http://kan.weibo.com/favicon.ico',
	URL		: 'http://kan.weibo.com/',
	check	: function(ps) {
		return ps.type == 'photo';
	},
	Photo	: {
		convertToForm: function(ps) {
			return {
				title	: ps.item,
				body	: ps.description + "\n" + xUtils.toWeiboText(ps.tags),
			}
		},
	},
	post : function(oldps){
		var self = this;
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
		//URL=http://kan.weibo.com/editwithplugin?title=%E6%88%91%E7%9A%84%E5%BE%AE%E5%8D%9A%20%E6%96%B0%E6%B5%AA%E5%BE%AE%E5%8D%9A-%E9%9A%8F%E6%97%B6%E9%9A%8F%E5%9C%B0%E5%88%86%E4%BA%AB%E8%BA%AB%E8%BE%B9%E7%9A%84%E6%96%B0%E9%B2%9C%E4%BA%8B%E5%84%BF&referrer=http%3A%2F%2Fwww.weibo.com%2Fsesadit%2Fprofile%3Fleftnav%3D1%26wvr%3D3.6%26mod%3Dpersonnumber&medias=[%22http%3A%2F%2Ftp1.sinaimg.cn%2F2820910492%2F180%2F40000413578%2F1%22]&editType=3
		var editor = self.URL + 'editwithplugin';
//URL=http://kan.weibo.com/aj/kandian/addsimple?__rnd=1347471754089
		var endpoint = self.URL + 'aj/kandian/addsimple';
		return self.getForm(editor,ps).addCallback(function(form) {
			update(form, self[ps.type.capitalize()].convertToForm(ps));
			return request(endpoint, {
				referrer:	editor,
				queryString: {
					'__rnd' : form._jsKey,
				},
				sendContent: form,
			});
		});

	},
	
	getWid	: function(key) {
		return request(this.URL + 'aj/weikan/list', {
					referrer	: this.URL,
					queryString	: {
						'__rnd'	:	key,
					},
				}).addCallback(function(res){
				/*
				 {"code":"100000","msg":"","data":[{"id":3489261203391134,"name":"\u300aThey Brow Me Away\u300b","selected":true}]}
				*/
				//alert(res.responseText);	
					var m = res.responseText.match(/"id":(\d+)/);
					if(m) {
						return m[1];
					}
					else {
						return false;
					}
		});
	},
	getForm : function(url,ps){
		var self = this;
		return request(url,{
				referrer	: ps.pageUrl,
				queryString : {
					title		: ps.item,
					referrer	: ps.pageUrl,
					editType	: 4,
					medias		: '["' + ps.itemUrl + '"]',
				},
			}).addCallback(function(res){
				var text = res.responseText;
				var m = text.match(/\$CONFIG\['servertime'\]\s+=\s+(\d+)\s*;/);
				if(!m) {
					throw new Error("Request failed, login required.");
				}
				var key = m[1];
				return self.getWid(key).addCallback(function(wid) {
					//alert('wid = ' + wid);
					if(!wid) {
						throw new Error("Get wid failed, login required maybe.");
					}
/*
medias={"http://hu.luo.bo/files/2011/10/07/f40b217a0a8bb5aafd5837f51971c57f.jpg":""}
wid=3489261203391134
title=title
apply=0
type=1
source_url=http://luo.bo/14967/
body=DESC
_jsKey=134747173478711
_t=0
*/
					return {
						_jsKey	: key,
						_t		: 0,
						type	: 1,
						title	: ps.item,
						wid		: wid,
						apply	: 0,
						medias	: '{"' + ps.itemUrl + '":""}',
						source_url : ps.pageUrl,
					};
				});
			});
	},
	
	postForm : function(fn){
		var self = this;
		var d = succeed();
		d.addCallback(fn);
		d.addCallback(function(res){
			//alert(res.responseText);
		});
		return d;
	},
	
});

