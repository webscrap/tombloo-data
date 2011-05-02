if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'FaveFaveFave',
	ICON : 'http://favefavefave.com/favicon.ico',
	
	check : function(ps){
		return (/photo/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),',');
        var privacy = '0';
        if(tag && tag.match(/public/,'i')) {
            privacy = '1';
        }
  //POSTDATA=post_title=%E6%9D%8E%E6%B2%90%E8%88%AA_Candice%E7%9A%84%E5%BE%AE%E5%8D%9A%20%E6%96%B0%E6%B5%AA%E5%BE%AE%E5%8D%9A-%E9%9A%8F%E6%97%B6%E9%9A%8F%E5%9C%B0%E5%88%86%E4%BA%AB%E8%BA%AB%E8%BE%B9%E7%9A%84%E6%96%B0%E9%B2%9C%E4%BA%8B%E5%84%BF&tags=test%2Ca%2Cb%2Cc&fileurl=http%3A%2F%2Fww2.sinaimg.cn%2Fbmiddle%2F597f79betw1dgrwty3nl1j.jpg      
        return request('http://favefavefave.com/save/', {
            referrer    : ps.pageUrl,
            sendContent : {
                post_title	: ps.item,
				tags		: tag,
				post_via	: ps.pageURL,
				fileurl		: ps.itemUrl,
           },
        });
	},
	
});
