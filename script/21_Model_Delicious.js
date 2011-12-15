(function() {
    var thismodel = models.Delicious;
    if(thismodel) {
		thismodel.check = function(ps){
			return true;
			return (/link|photo|text|quote/).test(ps.type);
		};
    	thismodel.ori_post = thismodel.post;
    	thismodel.post =  function(oldps){
    		models.pre_post(oldps);
    		var ps;
    		if(oldps.file) {
    			ps = models.file_to_link(oldps);
    		}
    		else {
    			ps = models.convert_to_link(oldps);
    		}
    		var actionUrl = 'http://secure.delicious.com/save';
    		return request(actionUrl, {
    			queryString :	{
    				title : ps.item,
    				url   : ps.itemUrl,
    				v	  : '6',
    				noui  : '1',
    				jump  : 'doclose'
    			},
    		}).addCallback(function(res){
    			var doc = convertToHTMLDocument(res.responseText);
    			var elmForm = doc;
    			if(!doc.getElementById('csrf_token')) 
    				throw new Error(getMessage('error.notLoggedin'));
    			var tags = joinText(ps.tags, ',');
    			tags = tags.replace(/\s+/g,'-');
    			return request(actionUrl, { 
    				'X-Requested-With' : 'XMLHttpRequest',
    				redirectionLimit : 0,
    				sendContent : update(formContents(elmForm), {
    					url		  :  ps.itemUrl,
    					title	   : ps.item,
    					note       : ps.description, 
    					tags        : tags,
    					'private'	: ((ps.adult || ps.private )? 'true' : 'false'),
    				}),
    			});
    		});
    	};
    }
    else {
    	alert('error no thismodel');
    }
})(); 
