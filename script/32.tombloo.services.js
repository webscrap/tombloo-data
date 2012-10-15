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
//			var re = /<img[^>]+src="([^"]+)"/g;
			var baseUrl = ctx.href;
			var matches = p.getElementsByTagName('img');
//			alert(matches.length);
			for(var i = 0;i<matches.length;i++) {
				var img = matches[i];
				images.push(resolveRelativePath(img.getAttribute("src"),baseUrl));
			}
			if(images.length) {
				return {
					images	: images,
					item	: ctx.title,
					itemUrl : images[0],
					type	: 'photo',
					description : joinText(images,"\n"),
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
		ps.item = image.getAttribute('title');
		ps.itemUrl = image.getAttribute('src');
		ps.pageUrl = image.getAttribute('href');
		ps.description = image.getAttribute('description');
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
	post_next : function(oldps,posters,posts,idx,count) {
		var doc = oldps.window ? oldps.window.document : null;
		var post = posts[idx];
		var self = this;
		if(idx < count) {
			idx++;
			var ps = update({},oldps,post);
			var msg = '[' + idx + '/' + count + '] Posting ' + ps.item + "(" + ps.itemUrl + ") ...";
			if(doc) {
				doc.title = msg;
			}
			if(post) {
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
					
					if(errs.length)
						self.alertError(errs.join('\n'), ps.page, ps.pageUrl, ps);
					return self.post_next(ps,posters,posts,idx,count);
				}).addErrback(function(err){
					self.alertError(err, ps.page, ps.pageUrl, ps);
					return self.post_next(oldps,posters,posts,idx,count);
				});
			}	
			else {
				return self.post_next(oldps,posters,posts,idx,count);
			}
		}
		else if(doc) {
			doc.title = oldps.item;
		}
		return succeed({});
	},
	post	:	function(ps,posters) {
		var self = this;
		var posts = [];
		if(ps.posts) {
			if(ps.description && ps.description.match(/^index:\[/)) {
				var mch = ps.description.match(/^index:\[([\d\-,\$\s]+)\]\s*(.*)$/);
				if(mch) {
					ps.description = mch[2];
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
			else if(ps.type == 'photo' && ps.description) {
				var images = ps.description.split("\n");
				images.forEach(function(img) {
					posts.push({itemUrl:img,type:'photo'});
				});
			}
			else {
				posts = ps.posts;
			}
		}
		ps.posts = null;
		//alert("Get " + (posts ? posts.length : '0') + " posts.");
		//throw new Error("Get " + (posts ? posts.length : '0') + " posts.");
		//what_the_f();
		if(posts && posts.length) {
			alert("Get " + (posts ? posts.length : '0') + " posts.");
			return self.post_next(ps,posters,posts,0,posts.length);
		}
		else {
			//self.alertError( new Error("No posts found."), ps.page, ps.pageUrl, ps);
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
