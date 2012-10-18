
(function() {
    var thismodel = models.Delicious;
    if(thismodel) {
		thismodel.check = function(ps){
			return true;
			return (/link|photo|text|quote/).test(ps.type);
		};
    	thismodel.ori_post = thismodel.post;
    	thismodel.post =  function(oldps){
			var ps = modelExt.createPost(oldps,'firefox');
			//var ps = oldps;
			if(ps.adult) {
				ps.private = 'true';
			}
			else if(ps.private) {
				ps.private = 'true';
			}
			else {
				ps.private = '';//'false';
			}
			var self = this;
			return this.getCurrentUser().addCallback(function(){
				return request('https://www.delicious.com/save', {
					queryString : {
						title : ps.item,
						url   : ps.itemUrl,
					}
				})
			}).addCallback(function(res){
				var doc = convertToHTMLDocument(res.responseText);
				var form = {};
				items(formContents(doc.documentElement)).forEach(function([key, value]){
					form[key.replace(/[A-Z]/g, function(c){
						return '_' + c.toLowerCase()
					})] = value;
				});
				return request('http://www.delicious.com/save', {
					sendContent : update(form, {
						title   : ps.item,
						url     : ps.itemUrl,
						note    : joinText([ps.body, ps.description], ' ', true),
						tags    : joinText(ps.tags, ','),
						private : ps.private,
					}),
				});
			}).addCallback(function(res){
				res = JSON.parse(res.responseText);
				if(res.error)
					throw new Error(res.error_msg);
			});
	},
	thismodel.getSuggestions = function(url){
		var self = this;
		var ds = {
			tags : this.getUserTags(),
			suggestions : this.getCurrentUser().addCallback(function(){
				return getPref('model.delicious.prematureSave')? 
					request('https://www.delicious.com/save', {
						queryString : {
							url : url,
						}
					}) : 
					request('https://www.delicious.com/save/confirm', {
						queryString : {
							url   : url,
							isNew : true,
						}
					});
			}).addCallback(function(res){
				var doc = convertToHTMLDocument(res.responseText);
				var elmItem        = doc.getElementById('saveTitle');
				var elmDescription = doc.getElementById('saveNotes');
				var elmTags        = doc.getElementById('saveTags');
				var elmPrivate     = doc.getElementById('savePrivate');
				return {
					editPage : 'https://www.delicious.com/save?url=' + url,
					form : {
						item        : elmItem ? elmItem.value : "",
						description : elmDescription ? elmDescription.value : "",
						tags        : elmTags ? elmTags.value.split(',') : "",
						private     : elmPrivate ? elmPrivate.checked : 0
					},
					
					duplicated : !!doc.querySelector('.saveFlag'),
					recommended : $x('id("recommendedField")//a[contains(@class, "m")]/text()', doc, true), 
				}
			})
		};
		
		return new DeferredHash(ds).addCallback(function(ress){
			var res = ress.suggestions[1];
			res.tags = ress.tags[1];
			return res;
		});
	 };
    }
    else {
    	alert('error no thismodel');
    }
})(); 
