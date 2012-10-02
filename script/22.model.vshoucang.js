
models.register({
	name : 'VShoucang',
	ICON : 'http://vshoucang.com/favicon.ico',
	SHARE_API : 'http://vshoucang.com/share_add.php',
	check : function(ps){
		return true;
	},
//http://vshoucang.com/share_add.php?url=http://huaban.com/xgytyghhab/&t=1349157857210&title=title&abs=desc&action=share_add
	share : function(ps,newTab) {
		var apiurl = this.SHARE_API;
		var queryString = {
				url		: ps.itemUrl,
				t		: '' + (+new Date),
				title	: ps.item,
				abs		: ps.description,
				action	: 'share_add',
		};
		if(!newTab) {
			return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : queryString,
			});
		}
		else {
			var params = [];
			for(i in queryString) {
				params.push(i + '=' + queryString[i]);
			}
			var url = apiurl + '?' + joinText(params,'&');
			return addTab(url);
		}
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,"firefox");//,'tumblr-file');
		var self = this;
		return self.share(ps).addCallback(
			function(res) {
				return self.checkPost(res,ps);
			}
		);
	},
	checkPost : function(res,ps) {
		var r = res.responseText;
		var self = this;
		if(r.match(/innerHTML\s*=\s*["']Saved["']/)) {
			return res;
		}
		else {
			self.share(ps,1);
			throw new Error("Post failed:\n " + r);
		}
	},
});
