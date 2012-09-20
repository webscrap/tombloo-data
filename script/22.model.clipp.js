(function(){
    if(models.Clipp) {
    	var thismodel = models.Clipp;
    	thismodel.ICON = 'http://clipp.in/favicon.ico';
    	thismodel.check =  function(ps) {
			return true;
    		return (/(photo|quote|link|video)/).test(ps.type) ;
    	};
    	thismodel.ori_post = thismodel.post;
    	thismodel.post = function(oldps) {
			var ps = modelExt.createPost(oldps,'tumblr+video');
			if(ps.type == 'photo') {
				ps.pageUrl += '#photo-url:' + ps.itemUrl;
			}
    		return thismodel.ori_post(ps);
    	};
    }
})();
