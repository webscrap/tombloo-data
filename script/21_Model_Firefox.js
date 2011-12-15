models.preprocess('FirefoxBookmark',true,true,true);
if(models.FirefoxBookmark) {
	var thismodel = models.FirefoxBookmark;
	thismodel.check = function(ps){
		return true;
		return (/(photo|quote|link)/).test(ps.type);
	};
}
