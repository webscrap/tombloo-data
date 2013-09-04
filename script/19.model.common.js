if(typeof(models)=='undefined')
	models = new Repository();

var xUtils = {
	escapeCode : function (text) {
		var code = text.replace('\\','\\\\','g');
		code = code.replace('"','\\"','g');
		code = code.replace('/','\\/','g');
		return code;
	},
	saveUrl : function (url) {
		var file = getDataDir('photo');
		createDir(file);
		var uri = createURI(url);
		var fileName = validateFileName(uri.fileName);
		file.append(fileName);
		clearCollision(file);
		return download(url, file);
	},
	getDir : function(name,root) {
		var dir = DirectoryService.get('ProfD', IFile);
		if(root) {
			dir.append(root);
		}
		else {
			dir.append('websaver');
		}
		if(!dir.exists()) {
			createDir(dir);
		}
		name && dir.append(name);
		return dir;
	},
	toWeiboText : function(tags) {
		var t = joinText(tags,'#, #');
		if(t) {
			return '#' + t + '#';
		}
		return '';
	},
	toTagText	: function(tags) {
		if(tags && tags.length) {
			return '#' + joinText(tags, ' #');
		}
		return '';
	},
	// ----- Helper functions -----
	/**
	 * スカラー型となりうる値のみ文字列として評価する
	 *
	 * @param  {Mixed}   x   任意の値
	 * @return {String}      文字列としての値
	 */
	stringify :	function (x) {
	    var result = '';
        var c;
	    if (x !== null) {
	        switch (typeof x) {
	            case 'string':
	            case 'number':
	            case 'xml':
	                result = x;
	                break;
	            case 'boolean':
	                result = x ? 1 : '';
	                break;
	            case 'object':
	                if (x) {
	                    c = x.constructor;
	                    if (c === String || c === Number ||
	                        (typeof XML !== 'undefined' && c === XML)
	                    ) {
	                        result = x;
	                    } else if (c === Boolean) {
	                        result = x ? 1 : '';
	                    }
	                }
	                break;
	            default:
	                break;
	        }
	    }
	    return result.toString();
	}
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
		return this.assertFalse(ps,{"private":true});
	},
	throwPost	: function(ps,properties) {
		for(var i=0;i<properties.length;i++) {
			var p = properties[i];
			if(ps[p]) {
				throw new Error (p + " post not supported.");
			}
		}
	},
	linkFile: function(ps) {
		ps.itemUrl = ps.pageUrl;
		ps.type = 'link';
		return ps;
	},
	linkAll: function(ps) {
		ps.description = ps.description || '';
		if(ps.body) {
			ps.description += "\n" + ps.body;
		}
		if(ps.type == 'link') {
			return ps;
		}
		ps.itemUrl = ps.pageUrl;
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
		if(ps.tags) {
			newps.tags = [];
			for(i in ps.tags) {
				newps.tags[i] = ps.tags[i];
			}
		}
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
				ps["private"] = true;
			}
			else {
				ps.adult = false;
			}
			if(tag.match(/private|myself/,'i')) {
				ps['private'] = true;
			}
			if(tag.match(/public/,'i')) {
				ps['private'] = false;
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
		if(ps.type == 'photo' && ps.pageUrl.match(/^https?:\/\/[^\/]+google\./)) {
			ps.pageUrl = ps.pageUrl.replace(/&(authuser|oq|gs_l|newwindow|hl|biw|bih|ei)=[^&]*/g,'');
		}
		['itemUrl','pageUrl'].forEach(function(p) {
			if(ps[p]) {
				ps[p].replace(/livedoor\.blogimg\.jp/g,'image.blog.livedoor.jp');
			}
		});
		if(!ps.item) {
			ps.item = '';
		}
		if(!ps.description) {
			ps.description = '';
		}
		ps.extended = true;
		return ps;
	},
	createPost : function(oldps,template,extent) {
		this.extendPost(oldps);
		var ps = this.copyPost(oldps);
		if(!template) template = '';
		if(template.match(/weheartit/)) {
		}
		if(template.match(/links/)) {
			if(ps.file) {
				this.linkFile(ps);
			}
			else if(ps.type == 'link') {
			}
			else if(ps.type == 'photo') {
				this.descPhoto(ps);
				ps.itemUrl = ps.pageUrl;
			}
			else {
				this.linkAll(ps);
			}
			ps.type = 'link';
		}
		if(template.match(/firefox/)) {
			if(ps.file)  {
				this.linkFile(ps);
			}
			else if(ps.type == 'photo') {
				this.descPhoto(ps);
				ps.itemUrl = ps.pageUrl + '#photo-url:' + ps.itemUrl;
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
			this.descLink(ps);
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
		if(thismodel && !thismodel.modelExtHooked) {
			thismodel.modelExtHooked = true;
			addAround(thismodel,"post",function(ori_post,args) {
				var oldps = args[0];
				var ps = oldps;
				if(template) {
					ps = modelExt.createPost(oldps,template);
				}
				if(assert) {
					modelExt.assertFalse(ps,assert);
				}
				args[0] = ps;
				return ori_post(args);
			});
			if(!check) {
				return true;
			}
			addAround(thismodel,'check',function(ori_check,args) {
				if(ori_check(args)) {
					return true;
				}
				if(check) {
					ps = args[0];
					return ps.type && ps.type.match(check);
				}
				return false;
			});
		}
		else {
			alert('No model named ' + ModelName + ' for pre processing.');
			return false;
		}
	},
	safeUrl : function(url) {
		if(url) {
			url = url.replace(/livedoor\.blogimg.jp/g,'image.blog.livedoor.jp');
			url = url.replace(/google\.com|facebook\.com|twitter\.com|twitpic\.com/g,'cctv.com');
		}
		return url;
	}
};
