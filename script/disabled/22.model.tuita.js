
models.register({
	name : '推它',

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
		var apiurl = 'http://www.tuita.com/share/v2?tmp=' + (+new Date);
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				sendContent	: {
					data	: '{"type":"photo","info":[{"img":"' + xUtils.escapeCode(ps.itemUrl) + '","alt":""}],"title":"' + ps.item + '","location":"' + xUtils.escapeCode(ps.pageUrl) + '"}',
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
				//m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				m = r.match(/"photo_url"\s*:\s*"([^"]+)/);
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
		var ps = modelExt.createPost(oldps,'tumblr-file+video');
		modelExt.assertFalse(ps,{'adult':false,'private':false});
	    var tag = joinText(ps.tags, ',');
		var actionUrl = 'http://www.tuita.com/post/create';
		return this.upload(ps).addCallback(function(data) {
			if(data) {
				var source = xUtils.escapeCode(ps.pageUrl);
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
						//post_content: '[{' + data.photo + '}]',
						post_content: '[{"photo_url":"' + data.photo + '","photo_text":"' + ps.item + '","exif":"","layout":"","desc":"' + ps.description + '"}]',
					},
				});
			}
//        if(ps.type == 'photo') {
            return request(actionUrl, {
	            referrer		: 'http://www.tuita.com/myblog/afun/new/blog/?from=http%3A%2F%2Fwww.tuita.com%2Fmyblog%2Fafun',
				'X-Requested-With' : 'XMLHttpRequest',
                sendContent : {
                    post_content : xUtils.escapeCode('<P><BR/><IMG data-mce-src="' + ps.itemUrl + '" alt="" src="' + ps.itemUrl + '"/></P><P><BR/>Source: <A data-mce-href="' + ps.pageUrl + '" href="' + ps.pageUrl + '" title="' + (ps.description || ps.itemUrl) + '" target="_blank">' + ps.pageUrl + '</A><BR/></P>'),
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

