
models.register({
	name : 'WebSaver',
	ICON : 'chrome://tombloo/skin/local.ico',
	
	
	check : function(ps){
		return (/(regular|photo|quote)/).test(ps.type);
	},
	
	allDir : xUtils.getDir('all'),

	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
	    var tag = joinText(ps.tags, ',');
		if(ps.type=='photo'){
			return this.postPhoto(ps,this.allDir);
		} else {
			var file = createDir(this.allDir);
			//xUtils.getDir('all');
			file.append(ps.item + ".txt");
			return this.append(file,ps);
		}
	},
	
	tagfs : function(file,tags) {
			var topDir = xUtils.getDir().path;
			var process = new Process(new LocalFile('/myplace/workspace/perl/tagfs'));
			process.run(false, ['-r',topDir,joinText(tags,","),file.path],4);
	},

	append : function(file, ps){
		clearCollision(file);
		putContents(
			file,
			joinText(
				[
					ps.item,
					ps.description,
					ps.body, 
					ps.itemUrl, 
					ps.pageUrl, 
					"[ " + joinText(ps.tags, ', ') + " ]"
				],
				'\n\n', 
				true)
			);
		return succeed().addCallback(function(){
			return file;
		}).addCallback(function(){
			var topDir = xUtils.getDir().path;
			var process = new Process(new LocalFile('/myplace/workspace/perl/tagfs'));
			process.run(false, ['-r',topDir,joinText(ps.tags,","),file.path],4);
		});
	},
	
	postPhoto : function(ps,allDir){
		var file = createDir(allDir);
		//createDir(file);
		
		if(ps.file){
			file.append(ps.item + "_" + ps.file.leafName);
		} 
		else {
			var uri = ps.itemUrl ? createURI(ps.itemUrl) : createURI(ps.pageUrl);
			var fileName = validateFileName(ps.item + "_" + uri.fileName);
			file.append(fileName);
		}
		clearCollision(file);
		return succeed().addCallback(function(){
			if(ps.file){
				ps.file.copyTo(file.parent, file.leafName);
				return file;
			} else {
				return download(ps.itemUrl, file);
			}
		}).addCallback(function(){
			var topDir = xUtils.getDir().path;
			var process = new Process(new LocalFile('/myplace/workspace/perl/tagfs'));
			process.run(false, ['-r',topDir,joinText(ps.tags,","),file.path],4);
		});
	},
	
});

