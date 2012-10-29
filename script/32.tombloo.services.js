//Tombloo.Service.o_post = Tombloo.Service.post;
Tombloo.Service.extractors.register({
		name : 'Video from Selection',
		ICON : 'chrome://tombloo/skin/video.png',
		check : function(ctx){
			return ctx.selection;
		},
		extract : function(ctx) {
			var body = createFlavoredString(ctx.window.getSelection());
			var video;
			var m = body.match(/<embed\s*(.+)<\/embed/);
			if(m) {
				video = m[1];
			}
			else {
				m = body.match(/<object\s*(.+)<\/object/);
				if(m) video = m[1];
			}
			if(video) {
				return {
					type: 'video',
					body: body,
					video: video,
					item    : ctx.title,
					itemUrl : ctx.href,
				}
			}
			else {
				return {
					type: 'quote',
					body: body,
					item    : ctx.title,
					itemUrl : ctx.href,
				}
			}
		},
});
Tombloo.Service.extractors.register({
		name : 'Photos from Selection',
		ICON : 'chrome://tombloo/skin/photo.png',
		check : function(ctx){
			return ctx.selection;
		},
		extract : function(ctx){
			var html = '';
			if (typeof ctx.window.getSelection != "undefined") {
				var sel = ctx.window.getSelection();
				var p = ctx.document.createElement("div");
				if (sel.rangeCount) {
					for (var i = 0, len = sel.rangeCount; i < len; ++i) {
						p.appendChild(sel.getRangeAt(i).cloneContents());
					}
					html = p.innerHTML;
				}
		    } else if (typeof ctx.document.selection != "undefined") {
				if (ctx.document.selection.type == "Text") {
					html = ctx.document.selection.createRange().htmlText;
					p.innerHTML = html;
				}
			}	
			var images = new Array;
			var baseUrl = ctx.href;
			var matches = p.getElementsByTagName('img');
			var posts = [];
			for(var i = 0;i<matches.length;i++) {
				var img = matches[i];
				var src = resolveRelativePath(img.getAttribute("src"),baseUrl);
				posts.push({
					itemUrl	: src,
					type	: 'photo',
				});

			}
			if(posts.length) {
				return {
					item	: ctx.title,
					itemUrl : posts[0].itemUrl,
					type	: 'photo',
					posts	: posts,
					window	: ctx.window,
				}
			}
			else {
				return {
					type    : 'quote',
					item    : ctx.title,
					itemUrl : ctx.href,
					body    : createFlavoredString(ctx.window.getSelection()),
					bodyHtml : html,
				}
			}
		},
});
Tombloo.Service.extractors.register({
		name : 'Links',
		ICON : 'chrome://tombloo/skin/link.png',
		SITES : /https?:\/\/(www\.)?(vshoucang\.com)/,
		check : function(ctx){
			return ctx.href.match(this.SITES);
		},
		extract : function(ctx) {
			var doc = ctx.window.document;
			var links = doc.getElementsByTagName('a');
			if(links.length) {
				//alert('Get ' + links.length + (links.length > 1 ? ' links' : ' link'));
				var ps = {
					type	: 'link',
					item	: ctx.title,
					itemUrl	: ctx.href,
					posts	: [],
					window	: ctx.window,
				};
				for(var idx=0;idx<links.length;idx++){
					var link = links[idx];
					var m = link.href.match(/jo\.php\?url=(.+)$/);
					if(m) {
						ps.posts.push({
							itemUrl	: unescape(m[1]),
							item	: link.text,
						});
					}
				};
				return ps;
			}
				return {
					type	: 'link',
					item	: ctx.title,
					itemUrl	: ctx.href,
				}
		},
});

Tombloo.Service.extractors.register({
		name : 'Video - Youku',
		ICON : 'http://www.youku.com/favicon.ico',
		check : function(ctx){
			return ctx.host.match('youku.com');
		},
		extract : function(ctx){
			var thumb = $x('id("s_msn1")/@href');
			if(thumb) {
				thumb = unescape(thumb);
				thumb = thumb.replace(/^.+&screenshot=/,'');
				thumb = thumb.replace(/&.+$/,'');
			}
			return {
				type    : 'video',
				item    : ctx.title,
				itemUrl : ctx.href,
				body    : $x('id("link3")/@value'),
				video   : $x('id("link2")/@value'),
				thumb	: thumb,
			}
		},
});

Tombloo.Service.extractors.register({
	name : 'Video',
	ICON : 'chrome://tombloo/skin/video.png',
	check: function(ctx) {
		return true;
	},
	extract : function(ctx) {
		var embeds = ctx.window.document.getElementsByTagName('embed');//$x('//embed');
		if(!embeds.length) {
			embeds = ctx.window.document.getElementsByTagName('object');//$x('//embed');
		}
		if(embeds.length) {
			var code = embeds[0].outerHTML;
			if(ctx.host.match('youku.com') && embeds.length>1) {
				code = embeds[1].outerHTML;
			}
			code = code.replace(/^\s*<object/,'<embed').replace(/<\/\s*object\s*>/,'</embed>');
		return {
			type	: 'video',
			item	: ctx.title,
			itemUrl : ctx.href,
			body	: code,
			description : code,
			thumb	: null,
		};
		}
		else {
			throw new Error('No video found');
		}
	}
});

Tombloo.Service.extractors.register({
	name : 'Photos - Images Miner',
	ICON : 'http://userscripts.org/images/script_icon.png',
	check : function(ctx) {
		return ctx.window.document.getElementById("xz_imagesminer_data");//.childNodes.length;
	},
	imageToPost : function(image) {
		var ps = {};
		ps.item = image.getAttribute('title') || image.getAttribute('text') || '';
		ps.itemUrl = image.getAttribute('src');
		ps.pageUrl = image.getAttribute('href');
		ps.page = ps.item || '';
		ps.description = image.getAttribute('description') || '';
		if(image.getAttribute('tags')) {
			ps.tags = image.getAttribute('tags').split(/\s*,\s*/);
		}
		return ps;
	},
	extract : function(ctx) {
		var ps = {
			type	: 'link',
			item	: ctx.title,
			itemUrl	: ctx.href,
			window	: ctx.window,
		};
		var images = ctx.window.document.getElementById("xz_imagesminer_data").childNodes;
		if(images && images.length) {
			ps.type = 'photo';
			update(ps,this.imageToPost(images[0]));
			if(images.length > 1) {
				ps.description = 'index:[0-' + (images.length -1) + ']';
				ps.itemUrl = this.ICON;
				ps.posts = [];
				ps.item = ctx.title;
				ps.page = ctx.title;
				for(var i=0;i<images.length;i++) {
					ps.posts.push(this.imageToPost(images[i]));
				}
			}
		}
		return ps;
	},
});


update(Tombloo.Service, {
	o_post	:	Tombloo.Service.post,
	reprError : function(err){
		// MochiKitの汎用エラーの場合、内部の詳細エラーを使う
		if(err.name && err.name.match('GenericError'))
			err = err.message;
		
		if(err.status)
			err = err.message + '(' + err.status + ')';
		
		if(typeof(err) != 'object')
			return '' + err;
	
		if(err.channel) {
			err.channel = "nsIHTTPChannel (HTTP Request Error)";
		};
		var msg = [];
		getAllPropertyNames(err, Object.prototype).forEach(function(prop){
			var val = err[prop];
			if(val == null || /(stack|name)/.test(prop) || typeof(val) == 'function')
				return;
			
			if(prop.toLowerCase() === 'filename' || prop === 'location')
				val = ('' + val).replace(/file:[^ ]+\/(.+?)( |$)/g, '$1');
			
			msg.push(prop + ' : ' + val);
		});
		
		return msg.join('\n');
	},
	delayPost : function(delay,ps,posters,doc,title) {
		var self = this;
		if(doc && title) {
			setTimeout(function(){
				doc.title = title;
				self.o_post(ps,posters);
			},delay);
		}
		else {
			setTimeout(function() {
				self.o_post(ps,posters);
			},delay);
		}
	},
	queuePost	: function(oldps,posters,posts,idx,count) {
		var DELAY = 20000;
		var self = this;
		if(!posters.length) {
			alert("Nothing to post");
			return succeed({});
		}
		var delay = 0;
		var doc = oldps.window ? oldps.window.document : null;
		if(doc) {
			for(var i=0;i<count;i++) {
				var ps = update({},oldps,posts[i]);
				var msg = '[' + (i+1) + '/' + count + '] Posting ' + ps.item + "(" + ps.itemUrl + ") ...";
				self.delayPost(delay,ps,posters,doc,msg);
				delay += DELAY;
			}
			setTimeout(function(){
				doc.title = oldps.item;
			},delay);
		}
		else {
			for(var i=0;i<count;i++) {
				self.delayPost(delay,update({},oldps,posts[i]),posters);	
				delay += DELAY;
			}
		}
		return succeed({});
	},
	postNext : function(oldps,posters,posts,idx,count) {
		var self = this;
		if(!posters.length) {
			alert("No posters for posting");
			return succeed({});
		}
		if(idx >= count) {
			return succeed({});
		}
		var doc = oldps.window ? oldps.window.document : null;
		if(!posts[idx]) {
			return succeed({});
		}
		var ps = update({},oldps,posts[idx]);

		idx++;

		if(doc) {
			var msg = '[' + idx + '/' + count + '] Posting ' + ps.item + "(" + ps.itemUrl + ") ...";
			doc.title = msg;
		}
		var ds = {};
		posters = [].concat(posters);
		posters.forEach(function(p){
			try{
				ds[p.name] = (ps.favorite && RegExp('^' + ps.favorite.name + '(\\s|$)').test(p.name))? p.favor(ps) : p.post(ps);
			} catch(e){
				ds[p.name] = fail(e);
			}
		});
		return new DeferredHash(ds).addCallback(function(ress){
			debug(ress);
			var errs = [];
			var ignoreError = getPref('ignoreError');
			ignoreError = ignoreError && new RegExp(getPref('ignoreError'), 'i');
			for(var name in ress){
				var [success, res] = ress[name];
				if(!success){
					var msg = name + ': ' + 
						(res.message.status? 'HTTP Status Code ' + res.message.status : '\n' + self.reprError(res).indent(4));
					
					if(!ignoreError || !msg.match(ignoreError))
						errs.push(msg);
				}
			}
			setTimeout(function() {
				if(doc) {
					doc.title = oldps.item;
				}
				return self.postNext(oldps,posters,posts,idx,count);
			},2000);
			if(errs.length)
				self.alertError(errs.join('\n'), ps.page, ps.pageUrl, ps);
		});
	},
	descExp	:	function(ps) {
		var exp = ps.description;
		var posts = [];
		if(!exp) {
			return ps.posts;
		}
		else if(exp.match(/^index:\[/)) {
			var mch = exp.match(/^index:\[([\d\-,\$\s]+)\]\s*(.*)$/);
			if(mch) {
				exp = mch[2];
				var indexs = mch[1].split(/\s*,\s*/);
				for(var i=0;i<indexs.length;i++) {
					var t = indexs[i];
					var m = t.match(/^\s*(\d+)\s*-\s*(\d+|\$)\s*$/);
					var s;
					var e;
					if(m) {
						s = +m[1];
						e = m[2];
						if(e == '$') {
							e = ps.posts.length - 1;
						}
						else {
							e = +e;
						}
					}
					else {
						t = t.replace(/^\s+/,'');
						t = t.replace(/\s+$/,'');
						if(t.match(/^\d+$/)) {
							s = +t;
							e = +t;
						}
						else {
							continue;
						}
					}
					for(var a=s;a<=e;a++) {
						posts.push(ps.posts[a]);
					}
				}
			}
		}
		else if(exp.match(/^(pageUrl|itemUrl|item):\/.+\//)) {
			var mch = exp.match(/^(pageUrl|itemUrl|item):\/(.+)\/\s*(.*)\s*$/); 
			if(mch) {
				var prop = mch[1];
				var regexp = new RegExp(mch[2]);
				exp = mch[3];
				for(var i=0;i<ps.posts.length;i++) {
					if(ps.posts[i][prop] && ps.posts[i][prop].match(regexp)) {
						posts.push(ps.posts[i]);
					}
				}
			}
		}
		else {
			return ps.posts;
		}
		ps.description = exp;
		return posts;
	},
	post	:	function(ps,posters) {
		var self = this;
		var posts = [];
		if(ps.posts && ps.posts.length) {
			if(ps.description) {
				posts = self.descExp(ps);
			}
			else {
				posts = ps.posts;
			}
		}
		else {
			posts = null;
		}
		ps.posts = null;
		if(posts) {
			if(confirm("Post " + (posts ? posts.length : '0') + " posts? ")) {
				return self.queuePost(ps,posters,posts,0,posts.length);
			}
			else {
				return succeed({});
			}
		}
		else {
			return self.o_post(ps,posters);
		}
	},
});
/*
[
	'Photo',
	'Link',
	'Photo - background image',
	'Photo - Capture',
	'Text',
	'Photo - area element',
	'Photo - image link',
	'Photo - Upload from Cache',
].forEach(function(value) {
	var target = Tombloo.Service.extractors[value];
	if(target) {
		var self = target;
		addAround(self,'extract', function(ori_func,args) {
			var ctx = args[0];
			var ps = ori_func(args);
			if(!ps) {
				return ps;
			}
			if(!ctx.window.getSelection()) {
				return ps;
			}
			if((!ps.body) && (!ps.description) && ctx) {
				ps.body = convertToPlainText(ctx.window.getSelection());
				if((!ps.description) && ps.body) {
					ps.description = ps.body;
					ps.body = null;
				}
			}
			return ps;
		});
	}
});
*/
