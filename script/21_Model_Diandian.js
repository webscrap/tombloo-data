
function escape_code (text) {
		var code = text.replace('\\','\\\\','g');
		code = code.replace('"','\\"','g');
		code = code.replace('/','\\/','g');
		return code;
}

if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : '点点',

	ICON : 'http://s.libdd.com/img/icon/favicon.$5106.ico',
	
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
	upload : function(ps) {
//	URL=http://www.diandian.com/share?ti=Kanye%20%26%20Kim%20Kardashian%20Courtside%20Cuddling%20At%20The%20Lakers%20Playoff%20Game%20%7C%20Necole%20Bitchie.com&lo=http%3A%2F%2Fnecolebitchie.com%2F2012%2F05%2F13%2Fkanye-kim-mania-at-the-lakers-game%2F&f=1&type=image&src[0]=http%3A%2F%2Fnecolebitchie.com%2Fwp-content%2Fuploads%2F2012%2F05%2FKim-Kanye-Lakers-Game.jpg
		var apiurl = 'http://www.diandian.com/share';///v2?tmp=' + (+new Date);
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : {
					ti			: ps.item,
					lo			: ps.pageUrl,
					f			: '1',
					type		: 'image',
					'src[0]'	: ps.itemUrl,
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			log(r);
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
				var m = r.match(/ENV\.blogUrl\s*=\s*'([^']+)/);
				if(m) {
					blogid = m[1];
				}
				else {
					throw new Error("No post_blog found");
				}
				//m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				m = r.match(/{"id":"([^"]+)","desc"/);
				if(m) {
					photo = m[1];
				}
				else {
					throw new Error("Upload failed");
				}
				m = r.match(/window.DDformKey\s*=\s*'([^']+)/);
				if(m) {
					formkey = m[1];
				}
				else {
					throw new Error("No formKey found! Request failed.");
				}
				return {formkey:formkey,blogid:blogid,photo:photo,referer:apiurl};
			}
			else {
					throw new Error("Server not responsed.Can't upload the picture");
			}
		});
	},
	post : function(oldps){
		models.pre_post(oldps);
		var ps = oldps;
		if(ps.file) {
			ps = models.file_to_link(oldps);
		}
	    var tag = joinText(ps.tags, ',');
		ps = models.link_to_video(ps);
		if(ps.type == 'photo') {
			return this.upload(ps).addCallback(function(data) {
				if(data) {
					var actionUrl = 'http://www.diandian.com/dianlog/' + data.blogid + '/new/photo';
					var source = escape_code(ps.pageUrl);
					return request(actionUrl,{
						referrer	: data.referer,
						'X-Requested-With' : 'XMLHttpRequest',
		                sendContent : {
							formKey		: data.formkey,
							title		: ps.item,
							tags		: tag,
							desc		: ps.description,
							layout		: '1',
							photos		: '[{"id":"' + data.photo + '","desc":"' + ps.item + '"}]',
							uri			: '',
							shareSource	: ps.pageUrl,
							privacy		: (ps.private || ps.adult) ? '2' : '0',
							setTop		: 'false',
							syncToWeibo	: "false",
							syncToQqWeibo	: "false",
							syncToDouban	: "false",
							syncToQzone	: "false",
							syncToRenren	: "false",
							syncToFacebook	: "false",
							syncToTwitter	: "false",
							syncToFlickr	: "false",
						},
					});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	
});
