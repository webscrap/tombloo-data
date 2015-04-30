
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
		var self = this;
		var ps = modelExt.createPost(oldps,'medialink');
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
        }).addCallback(function(res) {self.checkPost(res,ps);});;
	},
	checkPost : function(res) {
		var r = res.responseText;
		var self = this;
		if(r.match(/new_bm_form_title/)) {
			return succeed(res);
		}
		else if(r.match(/youdao\.com\/login/)) {
			throw new Error("Post failed: User not login");
		}
		else if(!ps.quiet) {
			throw new Error("Post failed:\n " + r);
		}
		else {
			throw new Error("Post failed:\n " + r);
		}
	},
	
});

