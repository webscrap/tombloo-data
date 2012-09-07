
function escape_code (text) {
		var code = text.replace('\\','\\\\','g');
		code = code.replace('"','\\"','g');
		code = code.replace('/','\\/','g');
		return code;
}

function url_to_file (url) {
	var file = getDataDir('photo');
	createDir(file);
	var uri = createURI(url);
	var fileName = validateFileName(uri.fileName);
	file.append(fileName);
	clearCollision(file);
	return download(url, file);
}

if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'Pinterest',

	ICON : 'http://pinterest.com/favicon.ico',
	
	check : function(ps){
		return true;
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	upload : function(ps) {
		var apiurl = 'http://pinterest.com/pin/create/bookmarklet/';
		//media=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg&url=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg&title=img1_src_5803249.jpg%20(JPEG%20Image%2C%20957%C2%A0%C3%97%C2%A0700%20pixels)&is_video=false&description=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg'http://www.diandian.com/share';///v2?tmp=' + (+new Date);
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : {
					media		: ps.itemUrl,
					url			: ps.pageUrl,
					title		: ps.item,
					is_video	: ps.type == 'video' ? 'true' : 'false',
					description	: ps.description,
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			log(r);
			if(r) {
				var boardid;
				var token;
				var form_url;
			/*
			//login:
				if(r.indexOf("diandian.com/login")) {
					log(r);
					throw new Error(getMessage('error.notLoggedin'));
				}
			*/
				var m = r.match(/id="id_board"[^>]+value="(\d+)"/);
				if(m) {
					boardid = m[1];
				}
				else {
					throw new Error("No BOARD found for posting");
				}
				//m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				m = r.match(/name='csrfmiddlewaretoken'[^>]+value='([^']+)/);
				if(m) {
					token = m[1];
				}
				else {
					throw new Error("No posting TOKEN found.");
				}
				m = r.match(/name="form_url"[^>]+value="([^"]+)/);
				if(m) {
					form_url = m[1];
				}
				else {
					throw new Error("No FORM_URL found! Request failed.");
				}
				return {id:boardid,token:token,form:form_url};
			}
			else {
					throw new Error("Server not responsed.Can't pin.");
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
		var tag_text = joinText(ps.tags,' #');
		if(tag_text) {
			tag_text = '[#' + tag_text + ']';
		}
		ps = models.link_to_video(ps);
		if(ps.type == 'photo') {
			return this.upload(ps).addCallback(function(data) {
/*
			caption=TEXTBODY #a #b #c
			board=370421206790179979
			tags=a,b,c
			replies=
			buyable=
			title=img1_src_5803249.jpg (JPEG Image, 957Â ÃÂ 700 pixels)
			media_url=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg
			url=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg
			via=
			csrfmiddlewaretoken=7efc27d396eecd8f63f1109feec08493
			form_url=/pin/create/bookmarklet/?media=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg&url=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg&title=img1_src_5803249.jpg%20(JPEG%20Image%2C%20957%C2%A0%C3%97%C2%A0700%20pixels)&is_video=false&description=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg
*/
				if(data) {
				var actionUrl = 'http://pinterest.com/pin/create/bookmarklet/';
					return request(actionUrl,{
						referrer	: data.referer,
						'X-Requested-With' : 'XMLHttpRequest',
		                sendContent : {
							caption		: ps.item + "\n" + ps.description + "\n" + tag_text,
							board		: data.id,
							tags		: tag,
							replies		: '',
							buyable		: '',
							title		: ps.item,
							media_url	: ps.itemUrl,
							url			: ps.pageUrl,
							via			: '',
							csrfmiddlewaretoken	: data.token,
							form_url	: data.form,
						},
					});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else if(ps.type == 'link') {
			throw new Error(ps.type + ' is not supported.');
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	
});

models.register({
	name : '轻微博',

	ICON : 'http://qing.weibo.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/(photo)/).test(ps.type);
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	upload : function(ps) {
		
		function checkuploadpic(key) {
			var check_url ='http://qing.weibo.com//blog/api/checkuploadpic.php';
			return request(check_url,{
					referrer	: 'http://qing.weibo.com/blog/controllers/capture.php',
					queryString	:	{
						'key'	:	key,
						'varname':	'data',
					},
				}
			).addCallback(function(cr) {
				cr = cr.responseText;
				log(cr);
				if(cr) {
					if(cr.match(/"code":"A00006"/)) {
						var m = cr.match(/:"(http:[^"]+sinaimg\.cn[^"]+)/);
						if(m) {
							return m[1];
						}
						else {
							return checkuploadpic(key);
						}
					}
				}
				throw new Error("Upload images failed." + "\n" + cr);
			});
		}

		/*
		 URL=http://qing.weibo.com//blog/api/uploadpic.php?imgurl[0]=http://img1.moko.cc/users/0/4/1409/logo/img1_des_6371738.jpg&imgurl[1]=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg&r=0.9654538532879774
		 URL=http://qing.weibo.com//blog/api/uploadpic.php?imgurl[0]=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg&r=0.20445356635301726

		 host=http://www.moko.cc/frieda/
		 */
		var apiurl = 'http://qing.weibo.com/blog/api/uploadpic.php';
		return request(apiurl, {
				referrer	: 'http://qing.weibo.com/blog/controllers/capture.php',
				queryString : {
					'imgurl[0]' : ps.itemUrl,
					'r'			: '0.6328942688406815',
				},
				sendContent:	{
					host	:	ps.pageUrl,
				},
			}	
		/*
		 {"code":"A00006","message":"upload_into_queue","data":{"key":"050d2bc4b32cb0aafc4103f26b703dd6","data":["http:\/\/img1.moko.cc\/users\/0\/4\/1409\/face\/img1_src_5803249.jpg"]}}
		 */
		).addCallback(function(res) {
			var r = res.responseText;
			log(r);
			if(r) {
				var key;
				var m = r.match(/"key":"([^\"]+)"/);
				if(m) {
					key = m[1];
					return checkuploadpic(key);
				}
/*
		URL=http://qing.weibo.com//blog/api/checkuploadpic.php?key=050d2bc4b32cb0aafc4103f26b703dd6&varname=requestId_78459659
		{"code":"A00006","message":"\u67e5\u8be2\u7ed3\u679c","data":{"http:\/\/img1.moko.cc\/users\/0\/4\/1409\/face\/img1_src_5803249.jpg":"http:\/\/ww1.sinaimg.cn\/mw600\/a823ad9cjw1dwoi43e9upj.jpg"}}
*/
			}
			else {
					throw new Error('Can not upload images.' + "\n" + r);
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
/*
 URL=http://qing.weibo.com//blog/api/picpost.php?from_type=capture

	pid=a823ad9cjw1dwohjxnxcuj
	title=TEXT
	photos=[{"img":"http://ww2.sinaimg.cn/mw600/a823ad9cjw1dwohjxnxcuj.jpg","desc":""},{"img":"http://ww4.sinaimg.cn/mw600/a823ad9cjw1dwohjymlq5j.jpg","desc":""}]
	privacy=0
	tag=tag1,tag2
	type=pic
	pub=0
	desc_all=æ¶éèªwww.moko.cc

D=o[0].img.substring(o[0].img.indexOf("mw600/")+6,o[0].img.lastIndexOf("."))

*/
				if(data) {
					var pid=data.substring(data.indexOf("mw600\\\/")+7,data.lastIndexOf("."));
					var actionUrl = 'http://qing.weibo.com//blog/api/picpost.php?from_type=capture';
					return request(actionUrl,{
						referrer	: 'http://qing.weibo.com/blog/controllers/capture.php',
						'X-Requested-With' : 'XMLHttpRequest',
		                sendContent : {
							pid			: pid,
							title		: ps.item,
							photos		: '[{"img":"' + data + '","desc":""}]',
							privacy		: ps.private ? '1' : '0',
							tag			: ps.private ? '' : tag,
							type		: 'pic',
							pub			: '0',
							desc_all	: ps.description,
						},
					}).addCallback(function(res) {
						var r = res.responseText;
						if(r.match(/"code":"A00006"/)) {
							return res;
						}
						throw new Error("Can not post images.\n" + r);
					});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else if(ps.type == 'link') {
			throw new Error(ps.type + ' is not supported.');
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	
});
