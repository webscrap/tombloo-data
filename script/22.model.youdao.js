
models.register({
	name : '有道书签',
	ICON : 'http://shared.ydstatic.com/images/favicon.ico',
	
	check : function(ps){
		return true;
		//return (/link|photo|text|quote|video|conversation/).test(ps.type);
	},
	/*
	URL=http://shuqian.youdao.com/manage?a=add
	POSTDATA=title=TITLE&url=http%3A%2F%2FURL&tags=TAG1%2CTAG2&note=DESC%0D%0ADESC
	*/
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'firefox');
	    var tag = joinText(ps.tags, ',');
        return request('http://shuqian.youdao.com/manage?a=popwindow', {
            referrer    : ps.pageUrl,
            sendContent : {
				type		: 'add',
                url         : ps.itemUrl,
                title       : ps.item,
                tags        : tag,
                note        : ps.description || ps.body || ps.pageUrl,
           },
        });
	},
	
});

