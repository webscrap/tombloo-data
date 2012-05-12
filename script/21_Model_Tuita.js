
function escape_code (text) {
		var code = text.replace('\\','\\\\','g');
		code = code.replace('"','\\"','g');
		code = code.replace('/','\\/','g');
		return code;
}

if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : '推他网',

	ICON : 'http://www.tuita.com/favicon.ico',
	
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
/*
data={"type":"photo","info":[{"img":"http:\/\/i2.sinaimg.cn\/ty\/2012\/0510\/U5295P6DT20120510160038.jpg","alt":"\u6d1b\u6749\u77f6\u65b0\u5ba0\u6324\u8d70\u74e6\u59ae\u838e"},{"img":"http:\/\/i2.sinaimg.cn\/ty\/http\/slide.sports.sina.com.cn\/k\/U6594P6T12D6016046F44DT20120409163134_small.jpg","alt":"\u9ad8\u6e05-\u5361\u6234\u73ca\u7d27\u8eab\u88e4\u72ec\u81ea\u5916\u51fa\u5c31\u533b \u907f\u8c08\u65b0\u7eef\u95fb\u7537\u53cb"},{"img":"http:\/\/i3.sinaimg.cn\/ty\/http\/slide.sports.sina.com.cn\/U4934P6T12D6035874F44DT20120424094814_small.jpg","alt":"\u9ad8\u6e05-\u5361\u6234\u73ca\u642d\u6863\u4fdd\u7f57\u51fa\u5e2d\u6d3b\u52a8 \u77ed\u88d9\u7206\u4e73\u73b0\u573a\u73a9\u6295\u7bee"},{"img":"http:\/\/i0.sinaimg.cn\/ty\/http\/slide.sports.sina.com.cn\/k\/U6594P6T12D6016039F44DT20120409162854_small.jpg","alt":"\u9ad8\u6e05-\u4f0a\u5a03\u73b0\u8eab\u67d0\u996e\u6599\u5ba3\u4f20\u6d3b\u52a8 \u6df1V\u4f4e\u80f8\u88c5\u5438\u5f15\u773c\u7403"},{"img":"http:\/\/i0.sinaimg.cn\/ty\/http\/slide.sports.sina.com.cn\/k\/U2028P6T12D5997111F44DT20120326101721_small.jpg","alt":"\u9ad8\u6e05-\u7f8e\u5973\u7ec4\u5408By2\u7a7f\u6797\u4e66\u8c6a\u7403\u8863\u62cd\u5199\u771f \u6797\u6765\u75af\u00d72"},{"img":"http:\/\/i2.sinaimg.cn\/ty\/http\/slide.sports.sina.com.cn\/k\/U6594P6T12D6016069F44DT20120409164037_small.jpg","alt":"\u9ad8\u6e05-\u5361\u6234\u73ca\u540c\u6bcd\u5f02\u7236\u59b9\u59b9\u51fa\u955c \u4fee\u957f\u7f8e\u817f\u5438\u5f15\u773c\u7403"}],"title":"NBA|NBA\u76f4\u64ad|NBA\u5b98\u65b9\u6388\u6743\u89c6\u9891\u76f4\u64ad\u7f51\u7ad9_\u65b0\u6d6a\u7ade\u6280\u98ce\u66b4_\u65b0\u6d6a\u7f51","location":"http:\/\/sports.sina.com.cn\/nba\/"}
*/
		var apiurl = 'http://www.tuita.com/share/v2?tmp=' + (+new Date);
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				sendContent	: {
					data	: '{"type":"photo","info":[{"img":"' + escape_code(ps.itemUrl) + '","alt":""}],"title":"' + ps.item + '","location":"' + escape_code(ps.pageUrl) + '"}',
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			if(r) {
				var blogid;
				var photo;
			/*
			//login:
				if(r.indexOf("tuita.com/login")) {
					log(r);
					throw new Error(getMessage('error.notLoggedin'));
				}
			*/
				var m = r.match(/"post_blog":"(\d+)"/);
				if(m) {
					blogid = m[1];
				}
				else {
					throw new Error("No post_blog found");
				}
				m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				if(m) {
					photo = m[1];
				}
				else {
					throw new Error("Upload failed");
				}
				return {blogid:blogid,photo:photo,referer:apiurl};
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
		if(ps.private || ps.adult) {
			return function() {return 1};
		}
	    var tag = joinText(ps.tags, ',');

/*
post_title=%E6%97%A5%E6%9C%AC%E7%BE%8E%E5%A5%B3%E6%9C%A8%E5%8F%A3
post_type=blog
blog_id=1483648926
sync_flag=0
post_tag=babe%2Cjp%2C%E6%9C%A8%E5%8F%A3
sticky=0
draft_id=106038
from=home
dtime=null
post_content=%7B%22body%22%3A%22%3CP%3E%3CBR%5C%2F%3E%3C%5C%2FP%3E%3CCENTER%3E%3CIMG%20alt%3D%5C%22%5C%22%20src%3D%5C%22http%3A%5C%2F%5C%2Fimg1.tuita.cc%5C%2Fa1%5C%2Ft%5C%2F22%5C%2Fb0%5C%2F1715876461-2814397.jpg%5C%22%5C%2F%3E%3C%5C%2FCENTER%3E%3CP%3EVia%20%3CA%20data-mce-href%3D%5C%22http%3A%5C%2F%5C%2Fwalletkiller.tuita.com%5C%2Fblogpost%5C%2F22860911%5C%22%20href%3D%5C%22http%3A%5C%2F%5C%2Fwalletkiller.tuita.com%5C%2Fblogpost%5C%2F22860911%5C%22%20title%3D%5C%22DESC%5C%22%20target%3D%5C%22_blank%5C%22%3Ehttp%3A%5C%2F%5C%2Fwalletkiller.tuita.com%5C%2Fblogpost%5C%2F22860911%3C%5C%2FA%3E%3CBR%5C%2F%3E%3C%5C%2FP%3E%22%7D
*/

/*
post_title=NBA|NBAç´æ­|NBAå®æ¹ææè§é¢ç´æ­ç½ç«_æ°æµªç«æé£æ´_æ°æµªç½
post_content=[{"photo_url":"a1\/t\/ee\/19\/1483648926-2846059","photo_text":"\u6d1b\u6749\u77f6\u65b0\u5ba0\u6324\u8d70\u74e6\u59ae\u838e","photo_type":"jpg","width":"100","height":"150","exif":"","layout":"1-2-3","desc":"<P><BR data-mce-bogus=\"1\"\/><\/P>"},{"photo_url":"a1\/t\/ee\/19\/1483648926-2846058","photo_text":"\u9ad8\u6e05-\u5361\u6234\u73ca\u7d27\u8eab\u88e4\u72ec\u81ea\u5916\u51fa\u5c31\u533b \u907f\u8c08\u65b0\u7eef\u95fb\u7537\u53cb","photo_type":"jpg","width":"100","height":"139","exif":""},{"photo_url":"a1\/t\/ee\/19\/1483648926-2846060","photo_text":"\u9ad8\u6e05-\u5361\u6234\u73ca\u642d\u6863\u4fdd\u7f57\u51fa\u5e2d\u6d3b\u52a8 \u77ed\u88d9\u7206\u4e73\u73b0\u573a\u73a9\u6295\u7bee","photo_type":"jpg","width":"100","height":"142","exif":""},{"photo_url":"a1\/t\/ee\/19\/1483648926-2846061","photo_text":"\u9ad8\u6e05-\u4f0a\u5a03\u73b0\u8eab\u67d0\u996e\u6599\u5ba3\u4f20\u6d3b\u52a8 \u6df1V\u4f4e\u80f8\u88c5\u5438\u5f15\u773c\u7403","photo_type":"jpg","width":"200","height":"120","exif":""},{"photo_url":"a1\/t\/ee\/19\/1483648926-2846056","photo_text":"\u9ad8\u6e05-\u7f8e\u5973\u7ec4\u5408By2\u7a7f\u6797\u4e66\u8c6a\u7403\u8863\u62cd\u5199\u771f \u6797\u6765\u75af\u00d72","photo_type":"jpg","width":"100","height":"157","exif":""},{"photo_url":"a1\/t\/ee\/19\/1483648926-2846057","photo_text":"\u9ad8\u6e05-\u5361\u6234\u73ca\u540c\u6bcd\u5f02\u7236\u59b9\u59b9\u51fa\u955c \u4fee\u957f\u7f8e\u817f\u5438\u5f15\u773c\u7403","photo_type":"jpg","width":"100","height":"138","exif":""}]
post_type=photoset
blog_id=1483648926
sync_flag=0
post_tag=
sticky=0
from=home
dtime=null
source=shareBookmark
post_extend={"share_source":"sports.sina.com.cn","share_url":"http:\/\/sports.sina.com.cn\/nba\/"}

*/

		var actionUrl = 'http://www.tuita.com/post/create';
		ps = models.link_to_video(ps);
		return this.upload(ps).addCallback(function(data) {
			if(data) {
				var source = escape_code(ps.pageUrl);
				return request(actionUrl,{
					referrer	: data.referer,
					'X-Requested-With' : 'XMLHttpRequest',
	                sendContent : {
						post_title	: ps.item,
						post_tag	: tag,
						sync_flag	: '0',
						sticky		: '0',
						from		: 'home',
						dtime		: 'null',
						source		: 'shareBookmark',
						post_extend : '{"share_source":"' + source + '","share_url":"' + source + '"}',
						post_type	: 'photoset',
						blog_id		: data.blogid,
						post_content: '[{' + data.photo + '}]',
						//"photo_url":"' + data.url + '","photo_text":"' + ps.item + '","exif":"","layout":"","desc":"' + ps.description + '"}]',
					},
				});
			}
//        if(ps.type == 'photo') {
            return request(actionUrl, {
	            referrer		: 'http://www.tuita.com/myblog/afun/new/blog/?from=http%3A%2F%2Fwww.tuita.com%2Fmyblog%2Fafun',
				'X-Requested-With' : 'XMLHttpRequest',
                sendContent : {
                    post_content : escape_code('<P><BR/><IMG data-mce-src="' + ps.itemUrl + '" alt="" src="' + ps.itemUrl + '"/></P><P><BR/>Source: <A data-mce-href="' + ps.pageUrl + '" href="' + ps.pageUrl + '" title="' + (ps.description || ps.itemUrl) + '" target="_blank">' + ps.pageUrl + '</A><BR/></P>'),
                    post_title   : ps.item,
                    post_tag     : tag,
					sync_flag	 : '0',
					sticky		: '0',
					from		: 'home',
					dtime		: 'null',
					post_type	: 'blog',
					blog_id		: '1483648926',
               },
            });
		});
	},
	
});
