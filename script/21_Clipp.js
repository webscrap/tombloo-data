(function(){
    if(models.Clipp) {
    	var thismodel = models.Clipp;
    	thismodel.ICON = 'http://clipp.in/favicon.ico';
    	thismodel.check =  function(ps) {
    		return (/(photo|quote|link|video)/).test(ps.type) ;
    	};
    	thismodel.ori_post = thismodel.post;
    	thismodel.post = function(oldps) {
    		models.pre_post(oldps);
    		var ps = oldps;
    		if(ps.file) {
    			ps = models.file_to_link(oldps);
    		}
    		return thismodel.ori_post(ps);
    	};
    }
})();
