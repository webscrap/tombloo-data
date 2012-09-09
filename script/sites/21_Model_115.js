if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : '115收藏',
	ICON : 'http://sc.115.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/link|photo|text|quote/).test(ps.type);
	},
	/*
	URL=http://sc.115.com/add
	POSTDATA=url=URL&title=TITLE&desc=DESC&labels=tag1%2Ctag2
	POSTDATA=url=URL&title=TITLE&desc=DESC&labels=tag1%2Ctag2&share=1
	*/
	post : function(oldps){
		models.pre_post(oldps);
		var ps;
		if(oldps.file) {
			ps = models.file_to_link(oldps);
		}
		else {
			ps = models.convert_to_link(oldps);
		}
	    var tag = joinText(ps.tags, ',');
        return request('http://sc.115.com/add', {
            referrer    : ps.pageUrl,
            sendContent : {
                url         : ps.itemUrl,
                title       : ps.item,
                labels      : tag,
                desc        : ps.description || ps.body || ps.pageUrl,
				share		: ((ps.adult || ps.private) ? '0' : '1'),
           },
        });
	},
	
});
