if(typeof(models)=='undefined')
	this.models = models = new Repository();

function cloneObject(oldObj) {
  var newObj = (oldObj instanceof Array) ? [] : {};
  for (i in oldObj) {
    if (oldObj[i] && typeof oldObj[i] == "object") {
		newObj[i] = cloneObject(oldObj[i]);
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
		if(tag.match(/private|myself/,'i')) {
			ps.private = true;
		}
		if(tag.match(/public/,'i')) {
			ps.private = false;
		}
		if(tag.match( ps.type + 'link')) {
			ps.tagtype = true;
		}
	}
	if(!(ps.type == 'link' || ps.tagtype)) {
		ps.tags.push(ps.type + 'link');
		ps.tagtype = true;
	}
	return ps;
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

