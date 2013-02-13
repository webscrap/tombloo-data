
models.register({
	name : 'TomblooBridge',
	ICON : 'chrome://tombloo/skin/local.ico',
	
	
	check : function(ps){
		return (/(regular|photo|quote|link)/).test(ps.type);
	},

	post : function(oldps){
		var ps = modelExt.createPost(oldps);
	    var tag = joinText(ps.tags, ',');
		var app = getPref('model.TomblooBridge.application');
		var TopDir = DirectoryService.get('ProfD', IFile);
		var profd =  TopDir.path;
		if(!app) {
			app = '/myplace/bin/tombloo-bridge';
		}
		if(!app.match(/\/|\\/)) {
			TopDir.append('tombloo');
			TopDir.append(app);
			app = TopDir.path;
		}
		var process = new Process(new LocalFile(app));
		var file = getTempFile('txt');	
		var args = [
				"<item>:\n\t" + ps.item,
				"<type>:\n\t" + ps.type,
				"<itemUrl>:\n\t" + ps.itemUrl,
				"<pageUrl>:\n\t" + ps.pageUrl,
				"<tags>:\n\t" + joinText(ps.tags,","),
				"<description>:\n\t" + (ps.description || ""),
				"<file>:\n\t"+ (ps.file ? ps.file.path : ""),
				"<profd>:\n\t" + profd,
				"<body>:\n\t" + ps.body,
				"<private>:\n\t" + (ps.private ? "1" : "0"),
				"<adult>:\n\t" + (ps.adult ? "1" : "0"),
		];
		putContents(file,joinText(args,"\n"),'UTF8');
		process.run(
			false,
			[file.path,profd],
			1
			);
		return succeed({});
	},
});

    
