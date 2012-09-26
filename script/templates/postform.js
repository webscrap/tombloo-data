
models.register({
	name : 'Juxtapost',
	ICON : 'http://www.juxtapost.com/favicon.ico',
	SHARE_API : 'http://www.juxtapost.com/post/',
	check : function(ps){
		return true;
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	share : function(ps,newTab) {
		var apiurl = this.SHARE_API;
		var queryString = {
			post		: ps.itemUrl,
			url			: ps.pageUrl,
			title		: ps.item,
			description : ps.description,
			video_bool	: (ps.type == 'video' ? 'true' : 'false'),
			hl			: '',
		}
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
	upload : function(ps) {
		var self = this;
		return this.share(ps).addCallback(function(res) {
			var doc = convertToHTMLDocument(res.responseText);
			var form = formContents(doc);
			return form;
		});
	},
	queue : function(data,ps) {
		var self = this;
		var tag_text = xUtils.toTagText(ps.tags);
		if(data) {
			var actionUrl = self.SHARE_API;
			update(data,{
				wb_org_desc	: '-',
				wb_desc		: ps.item,
				wb_title	: (ps.description ? ps.description + "\n\n" + tag_text : tag_text),
			});
			console.log(JSON.stringify(data));
			return request(actionUrl,{
				referrer	: data.wb_url,
				'X-Requested-With' : 'XMLHttpRequest',
                sendContent : data,
			});
		}
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,"weheartit");//,'tumblr-file');
		var self = this;
		if(ps.type == 'photo') {
			return this.upload(ps).addCallback(function(data) {
				if(data) {
					return self.queue(data,ps).addCallback(function(res) {return self.checkPost(res,ps);});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else if(ps.type == 'link') {
			throw new Error(ps.type + ' is not supported.');
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	checkPost : function(res,ps) {
		return res;
		var r = res.responseText;
		var self = this;
		if(r.match(/"errCode":\s*("0"|0)\s*,/)) {
			return res;
		}
		else {
			self.share(ps,1);
			throw new Error("Post failed:\n " + r);
		}
	},
});
