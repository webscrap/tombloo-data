
models.register({
	name : '点点',

	ICON : 'http://s.libdd.com/img/icon/favicon.$5106.ico',
	SHARE_API : 'http://www.diandian.com/share',///v2?tmp=' + (+new Date);
	
	check : function(ps){
		return true;
		return (/(photo|link|quote)/).test(ps.type);
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	share : function(ps,newTab) {
		var apiurl = this.SHARE_API;
//		URL=http://www.diandian.com/share?ti=Shay Maria&lo=http://shaymaria.tumblr.com/&f=1&type=link
		var type = 'image';
		if(ps.type == 'link') {
			type = 'link';
		}
		var queryString = {
			ti			: ps.item,
			lo			: ps.pageUrl,
			f			: '1',
			type		: type,
		}
		if(ps.type == 'photo') {
			queryString['src[0]'] = ps.itemUrl;
		}
		if(!newTab) {
			return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : queryString,
			});
		}
		else {
			var params = [];
			for(i in queryString) {
				params.push(i + '=' + queryString[i]);
			}
			var url = apiurl + '?' + joinText(params,'&');
			return addTab(url);
		}
	},
	upload : function(ps) {
//	URL=http://www.diandian.com/share?ti=Kanye%20%26%20Kim%20Kardashian%20Courtside%20Cuddling%20At%20The%20Lakers%20Playoff%20Game%20%7C%20Necole%20Bitchie.com&lo=http%3A%2F%2Fnecolebitchie.com%2F2012%2F05%2F13%2Fkanye-kim-mania-at-the-lakers-game%2F&f=1&type=image&src[0]=http%3A%2F%2Fnecolebitchie.com%2Fwp-content%2Fuploads%2F2012%2F05%2FKim-Kanye-Lakers-Game.jpg
		var self = this;
		return this.share(ps).addCallback(function(res) {
			var r = res.responseText;
			var err;
			var result;
			if(r) {
				var blogid;
				var photo;
				var formkey;
			/*
			//login:
				if(r.indexOf("diandian.com/login")) {
					log(r);
					throw new Error(getMessage('error.notLoggedin'));
				}
			*/
				var m = r.match(/\{value:"([^"]+)",\s*isPrivace:"1"/);
				if(!m) {
					m = r.match(/ENV\.blogUrl\s*=\s*'([^']+)/);
				}
				if(m) {
					blogid = m[1];
				}
				else {
					self.share(ps,1);
					throw new Error("No post_blog found");
				}
				//m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				if(ps.type == 'photo') {
					m = r.match(/{"id":"([^"]+)","desc"/);
					if(m) {
						photo = m[1];
					}
					else {
						self.share(ps,1);
						throw new Error("Upload failed");
					}
				}
				m = r.match(/window.DDformKey\s*=\s*'([^']+)/);
				if(m) {
					formkey = m[1];
				}
				else {
					self.share(ps,1);
					throw new Error("No formKey found! Request failed.");
				}
				return {formkey:formkey,blogid:blogid,photo:photo,referer:self.SHARE_API};
			}
			else {
					self.share(ps,1);
					throw new Error("Server not responsed.Can't upload the picture");
			}
		});
	},
	queue : function(data,ps) {
/*
formKey=b2d43b331da4db23a634e1640b19aabc
photos=[{"id":"93FFCA40C889B6A70F134C2B9E28BAB6","desc":""}]
title=
layout=1
shareSource=http://www.400kb.com/go.php?ref=hXLlpWUV8hofme0
desc=<p>[åç¢ç¡ç¢¼]çä¼¼LZRè³ç§é¨è§é¢[1][MP4/2MB]</p>
uri=
tags=
privacy=2
type=photo
blogUrl=blowmeoff
queue=true
syncToWeibo=false
syncToQqWeibo=false
syncToDouban=false
syncToQzone=false
syncToRenren=false
syncToFacebook=false
syncToTwitter=false
syncToFlickr=false
autoSaveId=5087813
*/

		if(data) {
			var actionUrl = 'http://www.diandian.com/draft/create';
			var sendContent = {
					formKey		: data.formkey,
					title		: ps.item,
					tags		: data.tag,
					desc		: ps.description,
					layout		: '1',
					uri			: '',
					shareSource	: ps.pageUrl,
					privacy		: (ps.private || ps.adult) ? '2' : '0',
					blogUrl		: data.blogid,
					queue		: 'true',
					syncToWeibo	: "false",
					syncToQqWeibo	: "false",
					syncToDouban	: "false",
					syncToQzone	: "false",
					syncToRenren	: "false",
					syncToFacebook	: "false",
					syncToTwitter	: "false",
					syncToFlickr	: "false",
			};
			if(ps.type == 'link') {
				sendContent.link = ps.itemUrl;
				sendContent.type = 'link';
				sendContent.desc = ps.itemUrl + "\n" + sendContent.desc;
			}
			else if(ps.type == 'photo') {
				sendContent.photos = '[{"id":"' + data.photo + '","desc":"' + ps.item + '"}]';
				sendContent.type = 'photo';
			}
			else {
				throw new Error(ps.type + ' is not supported.');
			}
			return request(actionUrl,{
				referrer	: data.referer,
				'X-Requested-With' : 'XMLHttpRequest',
                sendContent : sendContent,
			});
		}
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'tumblr-file');
	    var tag = joinText(ps.tags, ',');
		var self = this;
		return this.upload(ps).addCallback(function(data) {
			if(data) {
				var source = xUtils.escapeCode(ps.pageUrl);
				data.source = source;
				data.tag = tag;
				return self.queue(data,ps).addCallback(function(res) {return self.checkPost(res,ps);});
			}
			else {
				throw new Error('Sharing failed.');
			}
		});
	},
	checkPost : function(res,ps) {
		var r = res.responseText;
		var self = this;
		if(r.match(/"errCode":\s*("0"|0)\s*,/)) {
			return res;
		}
		else {
			self.share(ps,1);
			throw new Error("Post failed:\n " + r);
		}
	},
});
