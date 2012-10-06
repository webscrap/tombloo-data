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

function post_next(ps,posters,images,index,end) {
	var img = images[index];
	ps.itemUrl = img;
	var doc = ps.window ? ps.window.document : null;
	if(index < end) {
		index++;
		if(doc) {
			doc.title = '[' + index + '/' + end + '] Posting ' + ps.itemUrl + "...";
		}
		if(img) {
			return Tombloo.Service.o_post(ps,posters).addCallback(function() {
				return post_next(ps,posters,images,index,end);
			});
		}
		else {
			return post_next(ps,posters,images,index,end);
		}
	}
	else if(doc) {
		doc.title = ps.item;
	}
	return succeed({});
}

update(Tombloo.Service, {
	o_post	:	Tombloo.Service.post,
	post_next : function(ps,posters,posts,idx,count) {
		var doc = ps.window ? ps.window.document : null;
		var post = posts[idx];
		var self = this;
		if(idx < count) {
			idx++;
			var newps = update({},ps,post);
			if(doc) {
				doc.title = '[' + idx + '/' + count + '] Posting ' + newps.itemUrl + "...";
			}
			if(post) {
				return self.o_post(newps,posters).addCallback(function() {
					return self.post_next(ps,posters,posts,idx,count);
				});
			}	
			else {
				return self.post_next(ps,posters,posts,idx,count);
			}
		}
		else if(doc) {
			doc.title = ps.item;
		}
		return succeed({});
	},
	post	:	function(ps,posters) {
		var self = this;
		var posts = [];
		if(ps.posts && ps.posts.length) {
			if(ps.type == 'photo' && ps.description) {
				var images = ps.description.split("\n");
				images.forEach(function(img) {
					posts.push({itemUrl:img,type:'photo'});
				});
			}
			else {
				posts = ps.posts;
			}
		}
		if(posts && posts.length) {
			alert("Get " + (posts ? posts.length : '0') + " posts.");
			return self.post_next(ps,posters,posts,0,posts.length);
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
