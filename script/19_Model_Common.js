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

models.preprocess = function(ModelName,fileLink,toLink,toVideo) {
//	alert('1');
	var thismodel = models[ModelName];
	if(thismodel) {
//		alert('2');
		if(thismodel.ori_post || thismodel.ori_check) {
			return;
		}
		thismodel.ori_post = thismodel.post;
		thismodel.post = function(oldps) {
//			alert('3');
    		oldps = models.pre_post(oldps);
			var ps = models.copy_post(oldps);
    		if(fileLink && ps.file) {
    			ps = models.file_to_link(oldps);
    		}
			else if(toLink) {
				ps = models.convert_to_link(oldps);
			}

			if(toVideo) {
				ps = models.link_to_video(ps);
			}
    		return thismodel.ori_post(ps);
    	};
		thismodel.ori_check = thismodel.check;
		thismodel.check = function(ps) {
			if(thismodel.ori_check(ps)) {
				return true;
			}
			if(fileLink && ps.file) {
				return true;
			}
			else if(toLink && ps.type != 'video') {
				return true;
			}
			if(toVideo && ps.type == 'video') {
				return true;
			}
			return false;
		};
	}
	else {
		alert('No model named ' + ModelName + ' for pre processing.');
		return false;
	}
}


models.copy_post = function (ps) {
	var newps = cloneObject(ps);
	newps.tags = ps.tags;
	newps.file = ps.file;
	newps.body = ps.body;
	return newps;
};
		
models.pre_post = function (ps) {
	var tag = joinText(ps.tags, ' ');
	if(tag) {	
		if(tag.match(/,/)) {
			ps.tags = tag.split(/\s*,\s*/);
		}
		if(tag.match(/adult|X-|avcover|blowjob|nude|tits|porn/,'i')) {
			ps.adult = true;
			ps.private = true;
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
		if(tag.match(/gallery|galleries/,'i')) {
			ps.gallery = 1;
		}
		else {
			ps.gallery = 0;
		}
	}
	if(ps.type == 'quote' && ps.pageUrl.match(/flickr\.com\/photos\//)) {
		var source = new String(getFlavor(ps.body,'html'));
		source += ps.description;
		source = source.replace(/[\t\r\n]+/gm,'');
		var m = source.match(/img\s+src=\"([^"]+)_[mz](\.[^\."]+)\"/);
		if(m) {
			var itemUrl = m[1] + m[2];
			var pageUrl;
			var page;
			m = source.match(/page\s*\{([^{}]+)\}/);
			if(m) {
				pageUrl = m[1];
				ps.type = 'photo';
				ps.itemUrl = itemUrl;
				ps.pageUrl = pageUrl;
				ps.file = false;
				m = source.match(/title\s*\{([^{}]+)\}/);
				if(m) {
					ps.item = m[1];
				}
				m = source.match(/src\s*\{([^{}]+)\}/);
				if(m) {
					ps.description = ':' +  m[1];
				}
			}		
		}
	}
	if(ps.type == 'photo' && !ps.description) {
				ps.description = ":" + ps.pageUrl+"";
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
	if(ps.item) {
		//ps.item = ps.item.replace(/\s+-\s+[^-]+$/,'','g');
	}
	return ps;
};

models.link_to_video = function(ps) {
	var newps = models.copy_post(ps);
	if(newps.body && newps.body.match(/<embed|<object/)) {
		//newps.body = newps.body.replace(/(\<|\<\/)\s*object/g,'$1embed');
		newps.type = 'video';
	}
	if(newps.description && newps.description.match(/<embed|<object/)) {
		newps.body = ps.description;//.replace(/(\<|\<\/)\s*object/g,'$1embed');
		newps.description = "";
		newps.type = 'video';
	}
	return newps;
}

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
		newps.itemUrl = ps.pageUrl + '#photo-url:' + ps.itemUrl;
		newps.description = ps.description ? (ps.itemUrl + '\n' + ps.description) : ps.itemUrl;
	}
	else if(ps.type == 'quote' || ps.type == 'text') {
		newps.itemUrl = ps.pageUrl;
		newps.description = ps.description ? (ps.description + '\n\n' + ps.body) : ps.body;	
	}
	return newps;
};

