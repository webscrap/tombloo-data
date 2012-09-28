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
				if (sel.rangeCount) {
					var p = ctx.document.createElement("div");
					for (var i = 0, len = sel.rangeCount; i < len; ++i) {
						p.appendChild(sel.getRangeAt(i).cloneContents());
					}
					html = p.innerHTML;
				}
		    } else if (typeof ctx.document.selection != "undefined") {
				if (ctx.document.selection.type == "Text") {
					html = ctx.document.selection.createRange().htmlText;
				}
			}	
			var images = new Array;
			var re = /<img[^>]+src="([^"]+)"/g;
			var baseUrl = ctx.href;
			var matches;
			while(matches = re.exec(html)) {
				var img = matches[1];
				if(img.match('^http')) {
					images.push(resolveRelativePath(img,baseUrl));
				}
			}
			if(images.length) {
				return {
					images	: images,
					item	: ctx.title,
					itemUrl : ctx.href,
					type	: 'photo',
					description : joinText(images,"\n"),
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

function post_next(ps,posters,images,index,end) {
	var img = images[index];
	ps.itemUrl = img;
	if(index < end) {
		index++;
		if(img) {
			return Tombloo.Service.o_post(ps,posters).addCallback(function() {
				return post_next(ps,posters,images,index,end);
			});
		}
		else {
			return post_next(ps,posters,images,index,end);
		}
	}
	if(img) {
		return Tombloo.Service.o_post(ps,posters);
	}
	else {
		return succeed({});
	}
}

update(Tombloo.Service, {
	o_post	:	Tombloo.Service.post,
	post	:	function(ps,posters) {
		/*
		var m = ps.bodyHtml;
		if(!m) {
			return Tombloo.Service.o_post(ps,posters);
		}
		*/
		if(ps.images && ps.images.length && ps.description) {
			var images = ps.description.split("\n");
			alert("Get " + (images ? images.length : '0') + " images.");
			if(images.length){
				ps.type = 'photo';
				ps.description = '';
				return post_next(ps,posters,images,0,images.length - 1);
			}
			else {
				return succeed({});
			}
		}
		return Tombloo.Service.o_post(ps,posters);
	},
});

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
			if((!ps.body) && (!ps.description) && ctx) {
				ps.body = createFlavoredString(ctx.window.getSelection());
				if((!ps.description) && ps.body) {
					ps.description = ps.body;
					ps.body = null;
				}
			}
			return ps;
		});
	}
});
