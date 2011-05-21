if(typeof(models)=='undefined')
	this.models = models = new Repository();
	
models.pre_post = function (ps) {
	var tag = joinText(ps.tags, ' ');
	if(tag) {	
		if(tag.match(/,/)) {
			ps.tags = tag.split(/\s*,\s*/);
		}
		if(tag.match(/myself|adult|private|X-/,'i')) {
			ps.private = true;
		}
		if(tag.match(/public/,'i')) {
			ps.private = false;
		}
	}        
	return ps;
};
models.convert_to_link = function (ps) {
	if(ps.type == 'photo') {
		var tmp = ps.itemUrl;
		ps.itemUrl = ps.pageUrl;
		ps.description = ps.description ? (tmp + '\n' + ps.description) : tmp;
		ps.tags.push('imagelink');
	}
	else if(ps.type == 'quote' || ps.type == 'text') {
		ps.itemUrl = ps.pageUrl;
		ps.description = ps.description ? ( ps.description + '\n' + ps.body) : ps.body;
		ps.tag.push(ps.type + 'link');
	}
	return ps;
};