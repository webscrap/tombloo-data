
models.register({
	name : '爱库',
	ICON : 'http://www.ikeepu.com/favicon.ico',
	
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
		var ps = modelExt.createPost(oldps,'ikeepu+video');
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),' ');
        var privacy = '0';
        var sync = 'sina';
        var category = '';
        if(ps.adult || ps.private) {
            privacy = '1';
            sync = '';
        }

/*
 
URL=http://ikeepu.com/apps/bookmark/add

from=BOOKMARK.1.0
sid=10179480
url=http%3A%2F%2Fikeepu.com%2Fapp%2F20
type=page
referer=http%3A%2F%2Fikeepu.com%2Fapp%2F20
thumb=
cod_hack=%E2%84%A2
title=TITLE
category=
tag=tag1+tag2+
privacy=1
sync=sina
description=DESC
*/
		//var actionUrl = 'http://ikeepu.com/me/keep';
		var actionUrl = 'http://ikeepu.com/apps/bookmark/add';
        if(ps.type == 'photo') {
            return this.request(actionUrl, {
                referrer    : ps.pageUrl ,
                sendContent : {
					from		: 'BOOKMARK.1.0',
					cod_hack	: unescape('%E2%84%A2'),
					sid			: '0',
                    url         : ps.pageUrl + '#' + ps.itemUrl,
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
                    description : ps.description,
                    type        : ps.gallery ? 'page' : 'image',
                    thumb       : ps.itemUrl,
					referer		: ps.pageUrl,
               },
            });
        }
		else if (ps.type == 'video') {
			var embed = ps.body;
			var dom = convertToHTMLDocument(embed); 
			embed = dom.getElementsByTagName('embed')[0];
			if(!embed) {
				embed = dom.getElementsByTagName('object')[0];
			}
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
                    description : ps.description,
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
                    description : ps.description,
                    type        : 'page',
               },
            });
        }
	},
	
});

    
