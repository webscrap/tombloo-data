
models.register({
	name : '百度搜藏',
	ICON : 'http://cang.baidu.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/link|photo|text|quote/).test(ps.type);
	},
	
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'medialink');
	    var tag = joinText(ps.tags, ',');
        //tag = joinText(tag.split(/\s*,\s*/),',');
		/*
        var privacy = '0';
        if(ps.adult || ps.private) {
			privacy = '1';
        }
		*/
        //POSTDATA=ct=5&iu=http%3A%2F%2Fwww.baidu.com%2Fsearch%2Fcang_tools.html&st=0&dc=DESC&it=TITLE&tn=test%2Ctest%2Cgood%2Cgoodbye%2Cok%20let's%20go&_=
        return request('http://cang.baidu.com/do/cm', {
            referrer    : ps.pageUrl,
            sendContent : {
                ct          : '5',
                iu          : ps.itemUrl,
                it          : ps.item,
                tn          : tag,
                '_'         : '',
                st          : '0',
                dc          : ps.description,
           },
        });
	},
	
});
