

models.Tumblr.post = function(oldps){
	var self = this;
	var ps = modelExt.createPost(oldps,'tumblr+video');
	var endpoint = self.TUMBLR_URL + 'new/' + ps.type;
	ps.private = null;
	return this.postForm(function(){
		return self.getForm(endpoint).addCallback(function(form){
			var frm = self[ps.type.capitalize()].convertToForm(ps);
			frm['post[source_url]'] = ps.pageUrl;
			frm['channel_id'] = 'tidapost';	
			ps.private = null;
			update(form, frm);
			self.appendTags(form, ps);
			return request(endpoint, {sendContent : form});
		});
	});
};

models.Tumblr.postForm = function(fn){
		var self = this;
		var d = succeed();
		d.addCallback(fn);
		d.addCallback(function(res){
			var url = res.channel.URI.asciiSpec;
			switch(true){
			case /dashboard/.test(url):
				return;
			
			case /login/.test(url):
				throw new Error(getMessage('error.notLoggedin'));
			
			default:
				// このチェックをするためリダイレクトを弖う駅勣がある
				// You've used 100% of your daily photo uploads. You can upload more tomorrow.
				if(res.responseText.match('photo upload limit'))
					throw new Error("You've exceeded your daily post limit.");
				
				var doc = convertToHTMLDocument(res.responseText);
				throw new Error(convertToPlainText(doc.getElementsByClassName('errors')[0]));
			}
		});
		return d;
};

//var TumblrQueue = update({},models.Tumblr);
models.register(update(update({},models.Tumblr),
	{
		name : 'TumblrQueue',
		ICON : 'http://www.tumblr.com/favicon.ico',
		post : function(oldps) {
			var self = this;
			var ps = modelExt.createPost(oldps,'tumblr+video');
			var endpoint = self.TUMBLR_URL + 'new/' + ps.type;
			ps.private = null;
			return this.postForm(function(){
				return self.getForm(endpoint).addCallback(function(form){
					var frm = self[ps.type.capitalize()].convertToForm(ps);
					frm['post[source_url]'] = ps.pageUrl;
					frm['channel_id'] = 'tidapost';	
					ps.private = null;
					update(form, frm);
					self.appendTags(form, ps);
					form['post[state]'] = 2; //Queue
					return request(endpoint, {sendContent : form});
				});
			});
		},
	}
));



