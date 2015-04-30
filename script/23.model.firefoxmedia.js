
(function(){
	var ffmedia = {};
	update(ffmedia,models.FirefoxBookmark);
	update(ffmedia,{
		name : 'FirefoxMedia',
		ICON : 'chrome://tombloo/skin/firefox.ico',
		ANNO_DESCRIPTION : 'bookmarkProperties/description',
		check : function(ps) {
			return ps.type != 'link';
		},
	});
	models.register(ffmedia);
	modelExt.hookModel('FirefoxMedia','medialink');

	update(models.FirefoxBookmark,{
		check	: function(ps) {
			return ps.type.match(/photo|quote|link|video|regular/);
		},
		post	: function(oldps) {
			var ps = modelExt.createPost(oldps,'links');
			return succeed(this.addBookmark(ps.itemUrl, ps.item, ps.tags, ps.description));
		},
	});
})();

