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
					itemBak	: ctx.title,
					itemUrl : posts[0].itemUrl,
					type	: 'photo',
					posts	: posts,
					window	: ctx.window,
					description : 'index:[1-' + posts.length + ']',
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
					itemBak	: ctx.title,
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
		name : 'Video - 56.com',
		ICON : 'http://www.56.com/favicon.ico',
		check : function(ctx){
			return ctx.host.match('56.com');
		},
		extract : function(ctx){
			var id = ctx.window._oFlv_o && ctx.window._oFlv_o.EnId;
			if(!id) {
				var href = $x('id("pa_see_source")/a/@href');
				if(!href) {
					href = ctx.window.location.href;
				}
				if(href) {
					id = href.replace(/.*\/([^\/]+)\.html$/,'$1');
				}
			}
			if(id) {
				var href = 'http://player.56.com/v_' + id + '.swf';
				return {
					type    : 'video',
					item    : ctx.title,
					itemUrl : ctx.href,
					body	: '<embed src="' + href + '" width=480 height=405></embded>',
					video	: href,
				}
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
	name : 'Photos from Images Miner',
	// ICON : 'http://userscripts.org/images/script_icon.png',
	ICON :	'https://addons.cdn.mozilla.net/img/uploads/addon_icons/0/748-64.png',
	check : function(ctx) {
		//if(ctx.window.$myPlace.Cached.IMAGESMINER) return true;
		//return false;
		return ctx.window.document.getElementById("xz_imagesminer_data");//.childNodes.length;
	},
	extract : function(ctx) {
		var ps = {
			type	: 'link',
			item	: ctx.title,
			itemUrl	: ctx.href,
			window	: ctx.window,
			pageUrl : ctx.href,
		};
		//alert(ctx.window.$myPlace.Cached.IMAGESMINER);
		var images = ctx.window.document.getElementById("xz_imagesminer_data").childNodes;
		//var images = ctx.window.$myPlace.Cached.IMAGESMINER;
		if(images && images.length) {
			ps.type = 'photo';
			update(ps,{itemUrl : resolveRelativePath(images[0].getAttribute('src'),ctx.href)});
			if(images.length > 1) {
				var selected = [];
				ps.itemUrl = ps.itemUrl || this.ICON;
				ps.posts = [];
				ps.itemBak = ctx.title;
				ps.page = ctx.title;
				for(var i=0;i<images.length;i++) {
					var sel = images[i].getAttribute('selected') || '';
					if(sel == '1') {
						selected.push(i+1);
					}
					ps.posts.push({
						itemUrl : resolveRelativePath(images[i].getAttribute('src'),ctx.href),
						item : ps.item,
						pageUrl	: ps.pageUrl,
					});
				}
				if(selected && selected.length) {
					ps.description = 'index:[' + joinText(selected,',') + ']';
				}
				else {
					ps.description = 'index:[1-' + (images.length) + ']';
				}
			}
		}
		return ps;
	},
});

Tombloo.Service.extractors.register({
	name : 'Elements from Images Miner',
	// ICON : 'http://userscripts.org/images/script_icon.png',
	ICON :	'https://addons.cdn.mozilla.net/img/uploads/addon_icons/0/748-64.png',
	check : function(ctx) {
		//if(ctx.window.$myPlace.Cached.IMAGESMINER) return true;
		//return false;
		return ctx.window.document.getElementById("xz_imagesminer_data");//.childNodes.length;
	},
	imageToPost : function(image,ctx) {
		var ps = {};
		ps.item = image.getAttribute('title') || image.getAttribute('text') || '';
		ps.itemUrl = image.getAttribute('src');
		ps.pageUrl = image.getAttribute('href');
		ps.page = ps.item || '';
		ps.description = image.getAttribute('description') || image.getAttribute('desc') || '';
		if(image.getAttribute('tags')) {
			ps.tags = image.getAttribute('tags').split(/\s*,\s*/);
		}
		ps.itemUrl = ps.itemUrl ? resolveRelativePath(ps.itemUrl,ctx.href) : '';
		ps.pageUrl = ps.pageUrl ? resolveRelativePath(ps.pageUrl,ctx.href) : '';
		if(ps.itemUrl) {
			ps.type = 'photo';
		}
		else {
			ps.type = 'link';
			ps.itemUrl = ps.pageUrl;
		}
		//log(ps.pageUrl);
		return ps;
	},
	extract : function(ctx) {
		var ps = {
			type	: 'link',
			item	: ctx.title,
			itemUrl	: ctx.href,
			window	: ctx.window,
		};
		//alert(ctx.window.$myPlace.Cached.IMAGESMINER);
		var images = ctx.window.document.getElementById("xz_imagesminer_data").childNodes;
		//var images = ctx.window.$myPlace.Cached.IMAGESMINER;
		if(images && images.length) {
			ps.type = 'photo';
			update(ps,this.imageToPost(images[0],ctx));
			if(images.length > 1) {
				var selected = [];
				ps.itemUrl = ps.itemUrl || this.ICON;
				ps.posts = [];
				ps.item = ctx.title;
				ps.itemBak = ctx.title;
				ps.page = ctx.title;
				for(var i=0;i<images.length;i++) {
					var sel = images[i].getAttribute('selected') || '';
					if(sel == '1') {
						selected.push(i+1);
					}
					ps.posts.push(this.imageToPost(images[i],ctx));
				}
				if(selected && selected.length) {
					ps.description = 'index:[' + joinText(selected,',') + ']';
				}
				else {
					ps.description = 'index:[1-' + (images.length) + ']';
				}
			}
		}
		return ps;
	},
});


Tombloo.Service.extractors.register({
	name : 'Posts from selection ',
	ICON : 'http://weibo.com/favicon.ico',
	check : function(ctx){
			return ctx.selection && ctx.host.match(/weibo\.com|weibo\.cn|t\.sina\.com\.cn/);
		},
		extract : function(ctx){
			var html = '';
			var p = ctx.document.createElement("div");
			if (typeof ctx.window.getSelection != "undefined") {
				var sel = ctx.window.getSelection();
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
			
			var wb_detail = p.getElementsByClassName('WB_detail');
			//alert('WB_DETAIL:' + wb_detail.length);
			var posts = new Array;
			for(var i=0;i<wb_detail.length;i++) {
				var detail = wb_detail[i];
				var imgs = detail.getElementsByTagName('img');
				var text = detail.getElementsByClassName('WB_text');
				//alert('TEXT:' + text[0].textContent);
				var link = detail.getElementsByClassName('S_link2 WB_time');
				//alert('LINK:' + link[0].href);
				if(!(text && text.length)) {
					continue;
				}
				if(!(link && link.length)) {
					continue;
				}
				
				text = text[0].textContent.replace(/^[　\s]+/,'');
				text = text.replace(/[　\s]+$/,'');
				var href = link[0].href;				
				var title = ctx.document.title;
				title = title.replace(/\|[^\|]+$/,'');
				var images = 0;
				if(imgs && imgs.length) {
					var imgexp = /\/(bmiddle|thumbnail|thumb\d+|small|square|mw690)\/(.+)\.jpg$/;
					for(var j=0;j<imgs.length;j++) {
						var src = imgs[j].src;
						if(src && src.match(imgexp)) {
							images++;
							src = src.replace(imgexp,'/large/$2.jpg');
							posts.push({
								itemUrl	:	src,
								pageUrl	:	href,
								item	:	text + ' - ' + title,
								type	:	'photo',
							});
						}
					}
				}
				if(!images) {
					posts.push({
						itemUrl	: 	href,
						item	:	text + ' - ' + title,
						type	:	'link',
						pageUrl	:	ctx.href,
					});
				}
			}
			//alert('POSTS: ' + posts.length);
			if(posts.length > 1) {
				return {
					item	: ctx.title,
					itemBak	: ctx.title,
					itemUrl : posts[0].itemUrl,
					type	: 'photo',
					posts	: posts,
					window	: ctx.window,
					description : 'index:[1-' + (posts.length) + ']',
				}
			}
			else if(posts.length == 1) {
				return posts[0];
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
	delayPost : function(delay,ps,posters,doc,msg) {
		var self = this;
		ps.delayPost = delay;
		if(doc && msg) {
			setTimeout(function(){
				xUtils.msgbox(doc,msg);
				Tombloo.Service.post(ps,posters);
			},delay);
		}
		else {
			setTimeout(function() {
				Tombloo.Service.post(ps,posters);
			},delay);
		}
	},
	queuePost	: function(oldps,posters,posts,idx,count) {
		var DELAY = 40000;
		var self = this;
		if(!posters.length) {
			alert("Nothing to post");
			return succeed({});
		}
		var delay = 0;
		var doc = oldps.window ? oldps.window.document : null;
	
		for(var i=0;i<count;i++) {
			var ps = update({},oldps);
			if(ps.item != ps.itemBak) {
				posts[i].item = ps.item;
			}
			ps = update(ps,posts[i]);
			var msg;
			if(doc) {
				msg = '[' + (i+1) + '/' + count + '] Posting ' + ps.item + "(" + ps.itemUrl + ") ...";
			}
			Tombloo.Service.delayPost(delay,ps,posters,doc,msg);
			delay += DELAY;
		}
		if(doc) {
			setTimeout(function(){
				xUtils.msgbox(doc,'<font color="blue">' + count + ' items posted!</font>');
			},delay);
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
		var d = Tombloo.Service.post(ps,posters);
		if(doc) {
			var msg = '[' + idx + '/' + count + '] Posting ' + ps.item + "(" + ps.itemUrl + ") ...";
			doc.title = msg;
			d.addBoth(function(){
				doc.title = oldps.item;
				return Tombloo.Service.postNext(oldps,posters,posts,idx,count);
			});
		}
		else {
			d.addBoth(function(){
				return Tombloo.Service.postNext(oldps,posters,posts,idx,count);
			});
		}
		return d;
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
							e = ps.posts.length;// - 1;
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
						posts.push(ps.posts[a-1]);
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
				posts = Tombloo.Service.descExp(ps);
			}
			else {
				posts = ps.posts;
			}
			ps._multi_posts = 1;
			ps._posts = posts;
			ps._states = {};
		}
		else {
			posts = null;
		}
		ps.posts = null;
		if(posts) {
			if(confirm("Post " + (posts ? posts.length : '0') + " posts? ")) {
				return Tombloo.Service.queuePost(ps,posters,posts,0,posts.length);
			}
			else {
				return succeed({});
			}
		}
		else {
			return Tombloo.Service.o_post(ps,posters);
		}
	},
});

