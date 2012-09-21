if(typeof(models)=='undefined')

	models = new Repository();

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

var modelExt = {
	assertFalse : function(ps,property) {
		for(name in property) {
			if(typeof property[name] == 'boolean' && ps[name]) {
				throw new Error(name + " post not supported, ignored.");
			}
			else if(ps[name] && ps[name].match(property[name])){
				throw new Error(name + ' of Post match ' + property[name] + ', ignored.');
			}
		}
		return ps;
	},
	throwAdult : function(ps) {
		return this.assertFalse(ps,{adult:true});
	},
	throwPrivate: function(ps) {
		return this.assertFalse(ps,{private:true});
	},
	linkFile: function(ps) {
		ps.itemUrl = ps.pageUrl;
		ps.type = 'link';
		return ps;
	},
	linkAll: function(ps) {
			ps.itemUrl = ps.pageUrl;
			ps.description = ps.description || '';
			if(ps.body) {
				ps.description += "\n" + ps.body;
			}
			ps.type = 'link';
		return ps;
	},
	descLink: function(ps) {
		ps.description = ps.description || ps.body || '';
		ps.description = 'SOURCE: ' + ps.pageUrl + "\n\n  " + ps.description;
		return ps;
	},
	descPhoto: function(ps) {
		ps.description = ps.description || ps.body || '';
		ps.description = 'IMAGE: ' + ps.itemUrl + "\n\n  " + ps.description;
		return ps;
	},
	descVideo: function(ps) {
		if(ps.body && ps.body.match(/<embed|<object/)) {
		//ps.body = ps.body.replace(/(\<|\<\/)\s*object/g,'$1embed');
			ps.type = 'video';
		}
		if(ps.description && ps.description.match(/<embed|<object/)) {
			ps.body = ps.description;//.replace(/(\<|\<\/)\s*object/g,'$1embed');
			ps.description = "";
			ps.type = 'video';
		}
		return ps;
	},
	copyPost: function (ps,ext) {
		var newps = update({},ps);//cloneObject(ps);
/*		if(ps.tags) {
			newps.tags = [];
			for(i in ps.tags) {
				newps.tags[i] = ps.tags[i];
			}
		}
*/
		if(ext) {
			return this.extendPost(newps);
		}
		else {
			return newps;
		}
	},
	extendPost: function (ps) {
		if(ps.extended) {
			return ps;
		}
		var tag = joinText(ps.tags, ' ');
		if(tag) {	
			if(tag.match(/,/)) {
				ps.tags = tag.split(/\s*,\s*/);
			}
			if(tag.match(/nsfw|adult|^X-|avcover|avstar|blowjob|nude|tits|porn/,'i')) {
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
		var typetag = ps.type + 'link';
		if(tag && tag.match(typetag)) {
		}
		else if(!(ps.file || ps.type == 'link' )) {
			if(!ps.tags) {
				ps.tags = [ps.type + 'link'];
			}
			else {
				ps.tags.push(ps.type + 'link');
			}
		}
		if(ps.item) {
			ps.item = ps.item.replace(/\s+-\s+.*-\s+.*$/,'');
		}
		ps.extended = true;
		return ps;
	},
	createPost : function(oldps,template) {
		oldps = this.extendPost(oldps);
		var ps = this.copyPost(oldps);
		if(!template) return ps;
		if(template.match(/weheartit/)) {
		}
		if(template.match(/firefox/)) {
			if(ps.file)  {
				this.linkFile(ps);
			}
			else if(ps.type == 'photo') {
				ps.itemUrl = ps.pageUrl + '#photo-url:' + ps.itemUrl;
				this.descPhoto(ps);
			}
			else {
				this.linkAll(ps);
			}
		}
		if(template.match(/ikeepu/)) {
			if(ps.file) {
				this.linkFile(ps);
			}
			else if(ps.type.match(/quote|text|conversation/)) {
				this.linkAll(ps);
			}
		}
		if(template.match(/tumblr/)) {
			//ps.description = ps.description || ps.body;
			//ps.description = ps.item + "\n\n" + ps.description;
		}
		if(template.match(/weibo/)) {
			if(ps.file) this.fileLink(ps);
			if(ps.type == 'photo') {
				this.descPhoto(ps);
			}
		}
		if(template.match(/delicious/)) {
			if(ps.file) this.linkFile(ps);
			else if(ps.type == 'photo') {
				ps.itemUrl = ps.itemUrl + '#source-url:' + ps.pageUrl;
				this.descLink(ps);
			}
			else if(ps.type.match(/quote|text|video|conversation/)) {
				ps.itemUrl = ps.pageUrl;
				if(ps.body) {
					ps.description += "\n" + ps.body;
				}
			}
		}
		if(template.match(/\+source/)) {
			if(ps.type == 'photo') {
				this.descPhoto(ps);
			}
		}
		if(template.match(/\+video/)) {
			this.descVideo(ps);	
		}
		if(template.match(/-file/) && ps.file) {
			this.linkFile(ps);
		}
		return ps;
	},
	hookModel : function(ModelName,template,check,assert) {
		var thismodel = models[ModelName];
		if(thismodel) {
			if(thismodel.ori_post || thismodel.ori_check) {
				return;
			}
			thismodel.ori_post = thismodel.post;
			thismodel.post = function(oldps) {
				var ps = modelExt.createPost(oldps,template);
				if(assert) {
					modelExt.assertFalse(assert);
				}
				return thismodel.ori_post(ps);
	    	};
			thismodel.ori_check = thismodel.check;
			thismodel.check = function(ps) {
				if(thismodel.ori_check(ps)) {
					return true;
				}
				if(check) {
					return ps.type.match(check);
				}
				else {
					return true;
				}
				return false;
			};
		}
		else {
			alert('No model named ' + ModelName + ' for pre processing.');
			return false;
		}
	},
};
