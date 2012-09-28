
(function() {
	if(models.Flickr) {
	var thismodel = models.Flickr;
	thismodel.ori_post = thismodel.post;
	thismodel.post = function(oldps){
		var ps = modelExt.createPost(oldps);
		var tags = joinText(ps.tags, ' ');
		var desc = ps.description || '';
		if(tags.match(/reupload/)) {
			desc = 'src{' + ps.itemUrl + '}\npage{' + ps.pageUrl + '}\ntitle{' + ps.item + '}';
		}
		return (ps.file? succeed(ps.file) : download(ps.itemUrl, getTempFile())).addCallback(function(file){
			return models.Flickr.upload({
				photo       : file,
				title       : ps.item || ps.page || '',
				description : desc,
				is_public   : ps.private? 0 : 1,
				tags        : tags,
			});
		});
		};
	}
})();

