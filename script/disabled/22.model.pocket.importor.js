
models.register({
	name : 'Pocket Importor',
	ICON : 'http://getpocket.com/favicon.ico',
	check : function(ps){
		return ps.type == 'link';
	},
	_post : function(ps,links,pos,end) {
		var self = this;
		if(pos >= end) {
			if(ps.window) {
				ps.window.document.title = end + ' links imported.';
			}
			return succeed({});
		}
		else {
			var link = links[pos];
			pos++;
			ps.type = 'link';
			ps.itemUrl = link.url;
//			ps.item = link.text;
			if(ps.window) {
				ps.window.document.title = '[' + pos + '/' + end + '] ' + link.text + "...";
			}
			return models.Pocket.post(ps).addCallback(function(res) {
				return self.checkPost(res,ps).addCallback(function(res) {
					self._post(ps,links,pos,end);
				});
			});
		}
	},
	post : function(ps){
		if(!ps.links) {
			alert("No links found on " + ps.pageUrl);
			return succeed({});
		}
		return this._post(ps,ps.links,0,ps.links.length);
	},
	checkPost : function(res,ps) {
		var r = res.responseText;
		return succeed(res);
		var self = this;
		if(r.match(/innerHTML\s*=\s*["']Saved["']/)) {
			return succeed(res);
		}
		else {
			self.share(ps,1);
			throw new Error("Post failed:\n " + r);
		}
	},
});
