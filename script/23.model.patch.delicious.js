/*
URL=https://avosapi.delicious.com/api/v1/posts/addoredit


Origin=https://delicious.com
Referer=https://delicious.com/save?source=bookmarklet&url=https://www.google.com.hk/bookmarks/mark?op=add&hl=en&title=Google - Bookmarks&note=&v=1.1

url=https://www.google.com.hk/bookmarks/mark?op=add&hl=en
description=Google - Bookmarks
tags=tag1,tag2
note=desc
replace=
private=true
share=

*/
update(models.Delicious, {
		ICON:		'https://delicious.com/favicon.ico',
		check:		function(ps){return 2},
		post: 		function(oldps){
		var self = this;
		var ps = modelExt.createPost(oldps,'links');
	    var tag = joinText(ps.tags, ',');
        return request('https://avosapi.delicious.com/api/v1/posts/addoredit', {
            referrer    : 'https://delicious.com/save?source=bookmarklet&url=' + encodeURIComponent(ps.itemUrl) + "&title=" + ps.item + '&note=&v=1.1',
			headers	:	{
				Origin	:	'https://delicious.com',
			},
            sendContent : {
                url: 					ps.itemUrl,
                description: 		ps.item,
                tags:					tag,
                note: 				ps.description || ps.body,
				replace:			'true',
				'private':			(ps.adult || ps.private ) ? 'true' : '',
				share:				'',
           },
        }).addCallback(function(res) {self.checkPost(res,ps);});;
	},
	checkPost : function(res) {
		var r = res.responseText;
		var self = this;
		var m = r.match(/"status"\s*:\s*"([^"]+)"/);
		if(m) {
			if(m[1] == 'success' || m[1] == 'A') {
				return succeed(res);
			}
			else {
				throw new Error("Post failed, status: " + m[1]);
			}
		}
		else if(!ps.quiet) {
			throw new Error("Post failed:\n " + r);
		}
		else {
			throw new Error("Post failed:\n " + r);
		}
	},
});
