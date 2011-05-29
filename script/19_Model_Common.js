if(typeof(models)=='undefined')
	this.models = models = new Repository();

function cloneObject(oldObj) {
  var newObj = (oldObj instanceof Array) ? [] : {};
  for (i in oldObj) {
    if (oldObj[i] && typeof oldObj[i] == "object") {
		try {
			newObj[i] = cloneObject(oldObj[i]);
		}
		catch(e) {
		}
    } 
	else {
		newObj[i] = oldObj[i];
	}
  } 
  return newObj;
};

models.copy_post = function (ps) {
	var newps = cloneObject(ps);
	newps.tags = ps.tags;
	return newps;
};
		
models.pre_post = function (ps) {
	var tag = joinText(ps.tags, ' ');
	if(tag) {	
		if(tag.match(/,/)) {
			ps.tags = tag.split(/\s*,\s*/);
		}
		if(tag.match(/adult|X-/,'i')) {
			ps.adult = true;
		}
		else {
			ps.adult = false;
		}
		if(tag.match(/private|myself/,'i')) {
			ps.private = true;
		}
		if(tag.match(/public/,'i')) {
			ps.private = false;
		}
		if(tag.match( ps.type + 'link')) {
			ps.tagtype = true;
		}
		if(tag.match(/gallery|galleries|search|searching/),'i') {
			ps.gallery = 1;
		}
	}
	if(!(ps.file || ps.type == 'link' || ps.tagtype)) {
		if(!ps.tags) {
			ps.tags = [ps.type + 'link'];
		}
		else {
			ps.tags.push(ps.type + 'link');
		}
		ps.tagtype = true;
	}
	return ps;
};

models.file_to_link = function(ps) {
	if(!ps.file) {
		return ps;
	}
	var newps = models.copy_post(ps);
	newps.type = 'link';
	newps.itemUrl = ps.pageUrl;
	return newps;
};

models.convert_to_link = function (ps) {
	var newps = models.copy_post(ps);
	if(ps.type == 'photo') {
		newps.itemUrl = ps.pageUrl;
		newps.description = ps.description ? (ps.itemUrl + '\n' + ps.description) : ps.itemUrl;
	}
	else if(ps.type == 'quote' || ps.type == 'text') {
		newps.itemUrl = ps.pageUrl;
		newps.description = ps.description ? (ps.description + '\n' + ps.body) : ps.body;	
	}
	return newps;
};

