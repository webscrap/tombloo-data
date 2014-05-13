

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



