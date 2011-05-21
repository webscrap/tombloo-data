if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : '百度',
	ICON : 'http://cang.baidu.com/favicon.ico',
	
	check : function(ps){
		return (/link|photo|text|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
		models.pre_post(ps);
		models.convert_to_link(ps);
	    var tag = joinText(ps.tags, ',');
        //tag = joinText(tag.split(/\s*,\s*/),',');
        var privacy = '0';
        if(tag && tag.match(/public/,'i')) {
            privacy = '1';
        }
		if(tag && tag.match(/private|adult|X-/)) {
			privacy = '0';
		}
        //POSTDATA=ct=5&iu=http%3A%2F%2Fwww.baidu.com%2Fsearch%2Fcang_tools.html&st=0&dc=DESC&it=TITLE&tn=test%2Ctest%2Cgood%2Cgoodbye%2Cok%20let's%20go&_=
        return request('http://cang.baidu.com/do/cm', {
            referrer    : ps.pageUrl,
            sendContent : {
                ct          : '5',
                iu          : ps.itemUrl,
                it          : ps.item,
                tn          : tag,
                '_'         : '',
                st          : privacy,
                dc          : ps.description,
           },
        });
	},
	
});
