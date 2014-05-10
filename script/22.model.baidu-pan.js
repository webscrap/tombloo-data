
models.register({
	name : '百度云收藏',
	ICON : 'http://s2.pan.bdstatic.com/res/static/images/favicon.ico',
	
	check : function(ps){
		return true;
		return (/(photo|link|quote)/).test(ps.type);
	},
	//URL=http://wenzhang.baidu.com/content_ex/index
	getTok : function(url) {
		return request(
			'http://wenzhang.baidu.com/content_ex/index', 
			{referrer:	url}
		).addCallback(function(res) {
			var r = res.responseText;
			if(r) {
				var m = r.match(/bdstoken\s*:\s*'([^']+)'/);
				if(m) {
					return m[1];
				}
			}
			throw new Error("No bdstoken found");
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'ikeepu');
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),' ');
       
		var actionUrl = 'http://wenzhang.baidu.com/fav/add';
        if(ps.type == 'photo') {
			/*
			param={"from":"bm","records":[{"width":720,"height":2516,"url":"http://www.xxx5555.info/html/zhxz/15548/","title":"âã£ææ°ã®æ¬§ç¾æ ç ã£æååéâ03.08â_å¥å¥å§å§ç»¼åï¼·ï¼·ï¼·ï¼ï¼¸ï¼¸ï¼¸ï¼ï¼ï¼ï¼ï¼ï¼©ï¼®ï¼¦ï¼¯","res_src":"http://img789.com/images/2014/02/14/qqk06Tp.jpg","desc":"","type":"image"}]}
			*/
			// return this.getTok(ps.pageUrl).addCallback(function(tok){
				// request(actionUrl, {
					// referrer    : ps.pageUrl ,
					// sendContent : {
						// param:	JSON.stringify({
							// "from":"bm",
							// "records":[{
								// "url":ps.pageUrl,
								// "title":ps.item,
								// "text":ps.description,
								// "res_src":ps.itemUrl,
								// "content":'<p><a href="' + ps.pageUrl + '">' + ps.item + '</a><br /></p><img src="' + ps.itemUrl + '">',
								// "type":"article",
								// "tags":ps.tags,
							// }],
						// }),
						// bdstoken: tok,
				   // },
				 // });
            // });
            return this.getTok(ps.pageUrl).addCallback(function(tok){
				request(actionUrl, {
					referrer    : ps.pageUrl ,
					sendContent : {
						param:	JSON.stringify({
							"from":"bm",
							"records":[{
								//"width":960,
								//"height":639,
								"url":ps.pageUrl,
								"title":'[' + joinText(ps.tags,',') +']' + ps.item ,
								"res_src":ps.itemUrl,
								"desc":ps.description,
								"type":"image"}],
						}),
						bdstoken:tok,
				   },
				 });
            });
        }
        else if(ps.type == 'quote') {
		 return this.getTok(ps.pageUrl).addCallback(function(tok){
				request(actionUrl, {
					referrer    : ps.pageUrl ,
					sendContent : {
						param:	JSON.stringify({
							"from":"bm",
							"records":[{
								"url":ps.pageUrl,
								"title":ps.item,
								"text":ps.description,
								"res_src":null,
								"content":getFlavor(ps.body, 'html'),
								"type":"article",
								"tags":ps.tags,
							}],
						}),
						bdstoken: tok,
				   },
				 });
            });
        }
		else  {
		 return this.getTok(ps.pageUrl).addCallback(function(tok){
				request(actionUrl, {
					referrer    : ps.pageUrl ,
					sendContent : {
						param:	JSON.stringify({
							"from":"bm",
							"records":[{
								"url":ps.pageUrl,
								"title":ps.item,
								"text":ps.description,
								"res_src":null,
								"content":'<p><a href="' + ps.pageUrl + '">' + ps.item + '</a><br /></p>' + getFlavor(ps.body,'html'),
								"type":"article",
								"tags":ps.tags,
							}],
						}),
						bdstoken: tok,
				   },
				 });
            });
        }
	},
	
});

    
