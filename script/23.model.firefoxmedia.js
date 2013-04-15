
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
	modelExt.hookModel('FirefoxMedia','firefox');
})();

