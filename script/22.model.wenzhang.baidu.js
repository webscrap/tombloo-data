
models.register({
	name : '百度云文章',
	ICON : 'http://s.wenzhang.baidu.com/img/favicon.ico',
	
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
		var ps = oldps;      
		var actionUrl = 'http://wenzhang.baidu.com/fav/add';
		var desc = ps.description || '';
		var body = getFlavor(ps.body,'html') || '';
		if(oldps._states && oldps._states.wenzhang_baidu_ignore) {
		
		return; //succeed({});
		}
		var content = 
			'<div><a href="' + ps.pageUrl + '">' + ps.item + '</a></div>' +
			(desc ? '<div>' + desc + '</div>' : '') +
			(body ? '<div>' + body + '</div>' : '');
        if(ps.type == 'photo') {
			/*
			param={"from":"bm","records":[{"width":720,"height":2516,"url":"http://www.xxx5555.info/html/zhxz/15548/","title":"âã£ææ°ã®æ¬§ç¾æ ç ã£æååéâ03.08â_å¥å¥å§å§ç»¼åï¼·ï¼·ï¼·ï¼ï¼¸ï¼¸ï¼¸ï¼ï¼ï¼ï¼ï¼ï¼©ï¼®ï¼¦ï¼¯","res_src":"http://img789.com/images/2014/02/14/qqk06Tp.jpg","desc":"","type":"image"}]}
			*/
			content = '<div><a href="' + ps.pageUrl + '">' + ps.item + '</a></div>';
			
			if(oldps._multi_posts) {
				oldps._states.wenzhang_baidu_ignore = 1;
				content = content + '<div><ul>';
				for(var idx=0;idx<oldps._posts.length;idx++) {
					content = content + '<ol><img src="' + oldps._posts[idx].itemUrl + '"></img></ol>';
				}
				content = content + '</div>';
			}
			else {
				content = content + '<div><img src="' + ps.itemUrl + '"></div>';	
			}	
			content = content + '<div>' + desc + '</div>';
				
			return this.getTok(ps.pageUrl).addCallback(function(tok){
				request(actionUrl, {
					referrer    : ps.pageUrl ,
					sendContent : {
						param:	JSON.stringify({
							"from":"bm",
							"records":[{
								"url":ps.pageUrl,
								'link':ps.pageUrl,
								"title":ps.item,
								"text":desc,
								"res_src":ps.itemUrl,
								"content":content,
								"type":"article",
								"tags":ps.tags,
							}],
						}),
						bdstoken: tok,
				   },
				 });
            });
			/*
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
			*/
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
								"text":desc,
								"res_src":null,
								"content":content,
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
								"url":ps.itemUrl || ps.pageUrl,
								"title":ps.item,
								"text":desc,
								"res_src":null,
								"content": content,
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

    
