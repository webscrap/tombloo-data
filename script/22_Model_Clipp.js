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
    		models.pre_post(oldps);
    		var ps = oldps;
    		if(ps.file) {
    			ps = models.file_to_link(oldps);
    		}
			ps = models.link_to_video(ps);
			if(ps.type == 'photo') {
				ps.pageUrl = ps.pageUrl + '#' + ps.itemUrl;
			}
    		return thismodel.ori_post(ps);
    	};
    }
})();
