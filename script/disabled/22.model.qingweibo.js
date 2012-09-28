
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
							var m = cr.match(/:"-1"/);
							if(!m) {
								return checkuploadpic(key);
							}
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
		var ps = modelExt.createPost(oldps,'tumblr-file+video');
//		modelExt.assertFalse(ps,{'adult':true,'private':true});
//		var tag;
		if(ps.tags && ps.tags.length > 5) {
			tag = joinText([
					ps.tags[0],
					ps.tags[1],
					ps.tags[2],
					ps.tags[3],
					ps.tags[4]
				],',');

		}
		else {
			tag = joinText(ps.tags, ',');
		}
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
				var tag_text = (ps.tags) ? "#" + joinText(ps.tags,"#, #") + "#" : '';
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
							privacy		: '1',
							tag			: ps.private ? tag : tag,
							type		: 'pic',
							pub			: ps.private ? 'draft' : '0',
							desc_all	: ps.description + " " + tag_text,
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
