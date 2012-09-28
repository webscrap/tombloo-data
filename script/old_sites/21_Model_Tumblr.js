models.Tumblr.post = function(oldps){
		var self = this;
		models.pre_post(oldps);
		var ps = oldps;
		var endpoint = Tumblr.TUMBLR_URL + 'new/' + ps.type;
		return this.postForm(function(){
			return self.getForm(endpoint).addCallback(function(form){
				var frm = Tumblr[ps.type.capitalize()].convertToForm(ps);
				frm['post[source_url]'] = ps.pageUrl;
				update(form, frm);
				self.appendTags(form, ps);
				return request(endpoint, {sendContent : form});
			});
		});
	};

models.preprocess('Tumblr',0,0,1);
