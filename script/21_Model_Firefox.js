models.preprocess('FirefoxBookmark',true,true);
if(models.FirefoxBookmark) {
	var thismodel = models.FirefoxBookmark;
	this.check = function(ps){
		return (/(photo|quote|link)/).test(ps.type);
	};
}
