


if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : '新浪微博',
	ICON : 'http://weibo.com/favicon.ico',
	
	check : function(ps){
		return (/photo|texts|quote|link/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),',');
        var privacy = '0';
        if(tag && tag.match(/public/,'i')) {
            privacy = '1';
        }
// POSTDATA=content=fave%20-%20%E8%88%87%E6%82%A8%E5%88%86%E4%BA%AB%E5%96%9C%E5%A5%BD%E7%9A%84%E5%84%AA%E7%BE%8E%E5%9C%96%E7%89%87%E9%9B%86%20%0A%0AHello%2C%20world!%0A%0Ahttp%3A%2F%2Fwww.google.com&styleid=1&from=share&share_pic=http%3A%2F%2Fpic.fx3i.com%2F2011%2F04%2F22%2Fs%2Fa87ff679a2f3e71d9181a67b7542122c-1303482855.jpg%3F2010&sourceUrl=undefined&source=bookmark&appkey=8003029170

// POST http://v.t.sina.com.cn/share/aj_share.php?rnd=0.08631346548917906 
      // Referer[http://v.t.sina.com.cn/share/share.php?title=%E6%94%B6%E8%97%8F%2320294+-+fave&url=http%3A%2F%2Ffavefavefave.com%2Fview%2F20294&source=bookmark&appkey=2992571369]

   // Post Data:
      // content[%E6%94%B6%E8%97%8F%2320294%20-%20fave%20http%3A%2F%2Ft.cn%2Fhgyy2s]
      // styleid[1]
      // from[share]
      // share_pic[http%3A%2F%2Fpic.fx3i.com%2F2009%2F12%2F16%2Fsq%2F5cb9ed1a83392789ca8fb189e030e1f2-1261018800.jpg]
      // sourceUrl[undefined]
      // source[bookmark]
	  //POSTDATA=content=%E6%9D%8E%E6%B2%90%E8%88%AA_Candice%E7%9A%84%E5%BE%AE%E5%8D%9A%20%E6%96%B0%E6%B5%AA%E5%BE%AE%E5%8D%9A-%E9%9A%8F%E6%97%B6%E9%9A%8F%E5%9C%B0%E5%88%86%E4%BA%AB%E8%BA%AB%E8%BE%B9%E7%9A%84%E6%96%B0%E9%B2%9C%E4%BA%8B%E5%84%BF%0Ahttp%3A%2F%2Fww2.sinaimg.cn%2Fbmiddle%2F597f79betw1dgrwty3nl1j.jpg%0AHello%2C%20World!%0Atest%2Ca%2Cb%2Cc&styleid=1&share_pic=http%3A%2F%2Fww2.sinaimg.cn%2Fbmiddle%2F597f79betw1dgrwty3nl1j.jpg&from=share

		return request('http://v.t.sina.com.cn/share/aj_share.php?rnd=' + Math.random(1), {
            referrer    : ps.pageUrl,
			Pragma		: 'no-cache',
			'Cache-Control' : 'no-cache',
            sendContent : {
                content		: ps.item, //+ '\n' + ps.pageUrl + '\n' + ps.description + '\n' + tag,
				styleid		: '1',
				share_pic	: ps.itemUrl,
				sourceUrl	: 'undefined',
				from		: 'share',		
				source		: 'bookmark',
				appkey		: '8002029170',
           },
        });
	},
	
});
