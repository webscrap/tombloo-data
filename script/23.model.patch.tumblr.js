
models.Tumblr.post = function(oldps){
	var self = this;
	var ps = modelExt.createPost(oldps,'tumblr+video');
	var endpoint = Tumblr.TUMBLR_URL + 'new/' + ps.type;
	ps.private = null;
		return this.postForm(function(){
			return self.getForm(endpoint).addCallback(function(form){
				form['post[type]'] = ps.type;
				if(form['post[type]'] == 'photo'){
					if(ps.itemUrl) {
						form['external_urls[0]'] = ps.itemUrl;
					}
				}
				var frm = self[ps.type.capitalize()].convertToForm(ps);
				frm['post[source_url]'] = ps.pageUrl;
				frm['channel_id'] = 'tidapost';	
				ps.private = null;
				update(form, frm);
				self.appendTags(form, ps);
				
				return self._post(form);
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
			var endpoint = Tumblr.TUMBLR_URL + 'new/' + ps.type;
			ps.private = null;
			return this.postForm(function(){
				return self.getForm(endpoint).addCallback(function(form){
					form['post[type]'] = ps.type;
					if(form['post[type]'] == 'photo'){
						if(ps.itemUrl) {
							form['external_urls[0]'] = ps.itemUrl;
						}
					}
					var frm = self[ps.type.capitalize()].convertToForm(ps);
					frm['post[source_url]'] = ps.pageUrl;
					frm['channel_id'] = 'tidapost';	
					ps.private = null;
					update(form, frm);
					form['post[state]'] = 2; //Queue
					self.appendTags(form, ps);
					return self._post(form);
				});
			});
		},
	}
));



