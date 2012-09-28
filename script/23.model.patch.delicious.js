
(function() {
    var thismodel = models.Delicious;
    if(thismodel) {
		thismodel.check = function(ps){
			return true;
			return (/link|photo|text|quote/).test(ps.type);
		};
    	thismodel.ori_post = thismodel.post;
    	thismodel.post =  function(oldps){
			var ps = modelExt.createPost(oldps,'delicious');
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
			return thismodel.ori_post(ps);
		};
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
