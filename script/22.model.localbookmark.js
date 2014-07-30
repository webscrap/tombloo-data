
models.register({
	name : 'LocalBookmark',
	ICON : 'chrome://tombloo/skin/local.ico',
	
	
	check : function(ps){
		return (/(regular|photo|quote|link)/).test(ps.type);
	},

	post : function(oldps){
		var ps = modelExt.createPost(oldps,'firefox');
	    var tag = joinText(ps.tags, ',');
		var app = getPref('model.LocalBookmark.application');
		var TopDir = DirectoryService.get('ProfD', IFile);
		var profd =  TopDir.path;
		if(!app) {
			app = '/myplace/bin/localbookmark';
		}
		if(!app.match(/\/|\\/)) {
			TopDir.append('tombloo');
			TopDir.append(app);
			app = TopDir.path;
		}
		var process = new Process(new LocalFile(app));
		var file = getTempFile('txt');
		var content = {
				url         : ps.itemUrl,
                title       : ps.item,
                tags        : ps.tags,
                desc        : ps.description || ps.body || ps.pageUrl,
				time		: Date.now(),
		};
		putContents(file,'BOOKMARKS.push(' + JSON.stringify(content) + ');' + "\n",'UTF-16');
		process.run(
			false,
			[file.path,profd],
			1
			);
		return succeed({});
	},
});

    
