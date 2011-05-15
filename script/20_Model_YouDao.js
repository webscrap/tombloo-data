if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : '有道书签',
	ICON : 'http://shared.ydstatic.com/images/favicon.ico',
	
	check : function(ps){
		return (/link|photo|text|quote/).test(ps.type) && !ps.file;
	},
	/*
	URL=http://shuqian.youdao.com/manage?a=add
	POSTDATA=title=TITLE&url=http%3A%2F%2FURL&tags=TAG1%2CTAG2&note=DESC%0D%0ADESC
	*/
	post : function(ps){
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),',');
        var privacy = '0';
        if(tag && tag.match(/public/,'i')) {
            privacy = '1';
        }
		if(tag && tag.match(/private|adult|X-/)) {
			privacy = '0';
		}
        return request('http://shuqian.youdao.com/manage?a=add', {
            referrer    : ps.pageUrl,
            sendContent : {
                url         : ps.itemUrl,
                title       : ps.item,
                tags        : tag,
                note        : ps.description || ps.body || ps.pageUrl,
           },
        });
	},
	
});
