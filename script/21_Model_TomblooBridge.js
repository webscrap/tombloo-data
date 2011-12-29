

if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'TomblooBridge',
	ICON : 'chrome://tombloo/skin/local.ico',
	
	
	check : function(ps){
		return (/(regular|photo|quote)/).test(ps.type);
	},

	post : function(oldps){
		models.pre_post(oldps);
		var ps = oldps;
	    var tag = joinText(ps.tags, ',');
		var process = new Process(new LocalFile('/myplace/bin/tombloo-bridge'));
		var profd =  DirectoryService.get('ProfD', IFile).path;
		var args = [
				"item=>" + ps.item,
				'type=>' + ps.type,
				'itemUrl=>' + ps.itemUrl,
				'pageUrl=>' + ps.pageUrl,
				'tags=>' + joinText(ps.tags,","),
				'description=>' + (ps.description || ""),
				'file=>'+ (ps.file || ""),
				'profd=>' + profd,
				'body=>' + ps.body
		];
		var file = getTempFile('txt');	
		putContents(file,joinText(args,"\n"),'UTF8');
/*		
		if(ps.body && ps.body.length > 100) {
			var file = getTempFile('txt');	
			putContents(file,joinText(args,"\n"),'UTF-16');
			var outs =  new FileOutputStream(file,FileOutputStream.PR_WRONLY | FileOutputStream.PR_CREATE_FILE | FileOutputStream.PR_TRUNCATE, 420, -1);
			outs.write(ps.body,ps.body.length);
			outs.close();
			args.push('body-file=>'+file.path);
		}
		else {
			args.push('body=>' + ps.body);
		}
*/
		process.run(
			false,
			[file.path],
			1
			);
		return succeed();
	},
});
