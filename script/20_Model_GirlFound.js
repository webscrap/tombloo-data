if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'GirlFound',
	ICON : 'http://www.girlfound.com/favicon.ico',
	
	check : function(ps){
		return (/link|photo|text|quote/).test(ps.type) && !ps.file;
	},
	/*
	Referer=http://www.girlfound.com/post/?uri=http%3A%2F%2Fwww.zq.sd.cn%2Ftp%2Fnews%2F200807%2F2008-7-23_17474865213.jpg&title=%E7%99%BE%E5%BA%A6%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2_Vol.385%20Momoko%20Tani%20%E8%B0%B7%E6%A1%83%E5%AD%90&loc=http%3A%2F%2Fimage.baidu.com%2Fi%3Ftn%3Dbaiduimage%26ct%3D201326592%26lm%3D-1%26cl%3D2%26word%3DVol.385%2520Momoko%2520Tani%2520%25B9%25C8%25CC%25D2%25D7%25D3
	POSTDATA=item_title=TITLE&item_tags=tag1%2Ctag2&item_image=http%3A%2F%2Fwww.zq.sd.cn%2Ftp%2Fnews%2F200807%2F2008-7-23_17474865213.jpg&item_source=http%3A%2F%2Fimage.baidu.com%2Fi%3Ftn%3Dbaiduimage%26ct%3D201326592%26lm%3D-1%26cl%3D2%26word%3DVol.385%2520Momoko%2520Tani%2520%25B9%25C8%25CC%25D2%25D7%25D3
	
	URL=http://www.girlfound.com/add/item/
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
        return request('http://www.girlfound.com/add/item/', {
            referrer    : 'http://www.girlfound.com/post/?uri=' + ps.itemUrl + '&title=' + ps.item + '&loc=' + ps.pageUrl,
            sendContent : {
                item_image  : ps.itemUrl,
                item_title  : ps.item,
                item_tags   : tag,
				item_source	: ps.pageUrl,
           },
        });
	},
	
});
