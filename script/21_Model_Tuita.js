


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
			return 1;
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
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
		function makebody(text) {
			var html = text.replace('\\','\\\\','g');
			html = html.replace('"','\\"','g');
			html = html.replace('/','\\/','g');
			return '{"body":"' + html + '"}';
		}
		var actionUrl = 'http://www.tuita.com/post/create';
		ps = models.link_to_video(ps);
//        if(ps.type == 'photo') {
            return this.request(actionUrl, {
                referrer    : 'http://www.tuita.com/myblog/keyduel/new/blog/?from=http%3A%2F%2Fwww.tuita.com%2Fmyblog%2Fkeyduel',
				'X-Requested-With' : 'XMLHttpRequest',
                sendContent : {
                    post_content : makebody('<P><BR/><IMG alt="" src="' + ps.itemUrl + '"/></P><P><BR/>Source: <A data-mce-href="' + ps.pageUrl + '" href="' + ps.pageUrl + '" title="' + (ps.description || ps.itemUrl) + '" target="_blank">' + ps.pageUrl + '</A><BR/></P>'),
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
  /*      }
		else if (ps.type == 'video') {
			var embed = ps.body;
			var dom = convertToHTMLDocument(embed); 
			embed = dom.getElementsByTagName('embed')[0];
			//url=http://static.youku.com/v1.0.0188/v/swf/player.swf||VideoIDS=XMzAxMzQ0NTMy&ShowId=0&Cp=0&Light=on&THX=off&Tid=0&isAutoPlay=true&Version=/v1.0.0705&show_ce=1&winType=interior
			var url = embed.getAttribute('src') + '||';
			var attrs = new Array();
			for(var i=0;i<embed.attributes.length;i++) {
				var attr = embed.attributes[i];
				if(attr.name.match(/src/)) {
				}
				else {
					attrs.push(attr.name + '=' + attr.value);
				}
			}
			url = url + attrs.join('&');
            return this.request(actionUrl, {
                referrer    : ps.pageUrl,
				sendContent : {
					from		: 'BOOKMARK.1.0',
					cod_hack	: unescape('%E2%84%A2'),
					sid			: '0',
                    url         : url,
					referer		: ps.pageUrl,
					thumb		: '',
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
                    description : ps.description || ps.pageUrl,
                    type        : 'video',
               },
            });
		}
        else {
            return this.request(actionUrl, {
                referrer    : ps.pageUrl,
				sendContent : {
					from		: 'BOOKMARK.1.0',
					cod_hack	: unescape('%E2%84%A2'),
					sid			: '0',
                    url         : ps.pageUrl,
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
					referer		: ps.pageUrl,
					thumb		: '',
                    description : ps.description || ps.pageUrl,
                    type        : 'page',
               },
            });
        }
	*/
	},
	
});
