if(typeof(models)=='undefined')
	models = new Repository();

var xUtils = {
	json_stringify : function(obj) {
		var pairs = new Array();
		for(var k in obj) {
			k = k.replace(/"/,"\\\"","g");
			pairs.push('"' + k + '":"' + xUtils.stringify(obj[k].replace(/"/,'\\"','g')) + '"');
		}
		var r = '{' + joinText(pairs,",") + '}';
		return r;
	},
	selectImages : function(callback) {
		if (window.xuselectimages) return !1;
		Array.indexOf || (Array.prototype.indexOf = function (e) {
			for (var t = 0; this.length > t; t++)
				if (this[t] == e) return t;
			return -1
		}), window.xuselectimages = !0, window.scrollTo(0, 0);
		var e = document.getElementsByTagName("img"),
			t = document.createElement("link");
		if (t.href = "http://s1.pp.itc.cn/ux_cloud_atlas/js/modules/bookmark/css.css", t.rel = "stylesheet", t.type = "text/css", t.id = "BookmarkToolsJS", document.getElementsByTagName("HEAD").item(0).appendChild(t), 0 === e.length) {
			var n = '<div class="bookmarkbg" ><div class="bookmarknav" ><div class="bookmarknophoto" ><a href="javascript:;" id="BookmarkExit" class="bookmarkexit" >退出</a>该页面没有适合收藏的图片,请试试其他页面吧！</div></div></div><div class="bookmarkshadelayer" style=""></div>',
				i = document.createElement("div");
			i.setAttribute("id", "bookmarktool"), i.innerHTML = n, document.body.appendChild(i);
			var r = document.getElementById("BookmarkExit");
			r.addEventListener ? r.addEventListener("click", function () {
				document.body.removeChild(i)
			}) : r.attachEvent && r.attachEvent("onclick", function () {
				document.body.removeChild(i)
			})
		} else {
			var o = document.createElement("div");
			o.setAttribute("id", "bookmarktools_n_wrap");
			var a = document.createElement("div");
			a.setAttribute("id", "bookmarktools_i_container"), a.style.width = "100%";
			var s = document.createElement("a");
			s.setAttribute("id", "bookmarktools_j_"), s.setAttribute("href", "javascript:;"), s.setAttribute("class", "bookmarkexit"), s.className = "bookmarkexit";
			var l = document.createElement("a");
			l.setAttribute("id", "bookmarktools_l_"), l.setAttribute("href", "javascript:;"), l.setAttribute("class", "bookmarkrephoto"), l.className = "bookmarkrephoto";
			var c = document.createElement("div");
			c.setAttribute("id", "bookmarktools_k_");
			var u = document.createElement("a");
			u.setAttribute("id", "bookmarktools_p_"), u.setAttribute("class", "bookmarktools_opt"), u.className = "bookmarktools_opt", u.setAttribute("href", "javascript:;"), u.style.color = "#2E99E4", u.appendChild(document.createTextNode("选中全部图片"));
			var d = document.createElement("a");
			d.setAttribute("id", "bookmarktools_t_"), d.setAttribute("class", "bookmarktools_opt"), d.className = "bookmarktools_opt", d.setAttribute("href", "javascript:;"), d.style.color = "#2E99E4", d.style.display = "none", d.appendChild(document.createTextNode("反选全部图片"));
			var p = document.body.clientWidth,
				f = Math.floor((p - 200) / 232),
				h = Math.floor((p - 232 * f) / 2),
				m = document.createElement("div");
			m.setAttribute("id", "bookmarktools_o_"), m.style.margin = "50px auto", m.style.padding = "0px " + h + "px";
			var g = document.createElement("div");
			g.setAttribute("id", "bookmarktools_g_");
			var v = null,
				y = null,
				b = [],
				x = {
					overflow: "hidden",
					padding: "5px",
					margin: "10px",
					width: "200px",
					height: "200px",
					display: "inline-block",
					textAlign: "center",
					border: "1px solid #fff",
					borderRadius: "5px",
					background: "#fff",
					cssFloat: "left",
					styleFloat: "left",
					cursor: "pointer",
					position: "relative"
				},
				w = {
					overflow: "hidden",
					display: "inline-block",
					border: "6px solid orange",
					padding: "4px",
					marginBottom: "10px",
					boxShadow: "2px 2px 0 #ff8b33",
					borderRadius: "2px",
					background: "#ff8b33",
					lineHeight: "16px",
					cssFloat: "right",
					styleFloat: "right",
					color: "#fff",
					cursor: "pointer",
					marginRight: "6px",
					position: "relative"
				},
				k = function (e, t) {
					for (var n in t) t.hasOwnProperty(n) && (e.style[n] = t[n])
				},
				C = function () {
					var e = this.firstChild,
						t = b.indexOf(e.src);
					t >= 0 ? (b.splice(t, 1), this.style.background = "#fff") : (b.push(e.src), this.style.background = "#ff8b33")
				},
				v = function () {
					if (0 === b.length) alert("请选择图片");
					else {
						return callback(b,document);	
					}
				},
				T = function () {
					document.body.removeChild(a), document.body.removeChild(o), window.xuselectimages = !1
				};
			u.onclick = function () {
				for (var e = document.getElementById("bookmarktools_o_").getElementsByTagName("div"), t = 0; e.length > t; t++) {
					0 != t && (e[t].style.backgroundColor = "#ff8b33");
					for (var n = e[t].getElementsByTagName("img"), i = 0; n.length > i; i++) {
						var r = n[i].getAttribute("src");
						b.push(r)
					}
				}
				document.getElementById("bookmarktools_p_").style.display = "none", document.getElementById("bookmarktools_t_").style.display = "inline-block"
			}, d.onclick = function () {
				for (var e = document.getElementById("bookmarktools_o_").getElementsByTagName("div"), t = 0; e.length > t; t++) 0 != t && (e[t].style.backgroundColor = "#FFFFFF"), b = [];
				document.getElementById("bookmarktools_p_").style.display = "inline-block", document.getElementById("bookmarktools_t_").style.display = "none"
			}, l.appendChild(document.createTextNode("转载到搜狐相册")), l.onclick = v, s.appendChild(document.createTextNode("退出")), s.onclick = T, g.appendChild(s), g.appendChild(l);
			var _ = document.createElement("span");
			_.setAttribute("class", "bookmarktips"), _.className = "bookmarktips", _.appendChild(document.createTextNode("选择您希望转载的图片到您的搜狐相册当中")), g.appendChild(_), g.appendChild(u), g.appendChild(d), m.appendChild(g);
			for (var E = 1, S = 0, N = 0, A = e.length; A > N; N++) "none" == e[N].style.display || "hidden" == e[N].style.visibility || 0 === e[N].offsetWidth || 0 === e[N].offsetHeight || 200 > e[N].offsetWidth || 200 > e[N].offsetHeight || (S += 1, v = document.createElement("div"), k(v, x), y = new Image, y.src = e[N].src, v.onclick = C, y.onload = function () {
				this.width > this.height ? this.width > 200 && (this.width = 200) : this.height > 200 && (this.height = 200), (this.naturalWidth && 200 > this.naturalWidth || this.naturalHeight && 200 > this.naturalHeight) && m.removeChild(this.parentNode)
			}, v.className = "bookmarktools_img", v.appendChild(y), m.appendChild(v), k(o, {
				zIndex: 12e7,
				width: "10000px",
				height: "10000px",
				position: "fixed",
				display: "block",
				left: "0px",
				top: "0px",
				background: "#000",
				opacity: .8,
				filter: "alpha(opacity=80)"
			}), k(a, {
				zIndex: 13e7,
				position: "absolute",
				cssFloat: "right",
				styleFloat: "right",
				left: 0,
				top: 0,
				padding: "0px",
				margin: "0px"
			}), k(g, {
				borderRadius: "5px",
				background: "#fff",
				height: "35px",
				lineHeight: "38px",
				padding: "15px",
				margin: "13px",
				font: "normal 14px/38px Helvetica,Arial,sans-serif"
			}), k(c, w), document.body.appendChild(o), a.appendChild(m), document.body.appendChild(a));
			if (E && 0 == S) {
				E = 0;
				var n = '<div class="bookmarkbg" ><div class="bookmarknav" ><div class="bookmarknophoto" ><a href="javascript:;" id="BookmarkExit" class="bookmarkexit" >退出</a>该页面没有适合收藏的图片,请试试其他页面吧！?</div></div></div><div class="bookmarkshadelayer" style=""></div>',
					i = document.createElement("div");
				i.setAttribute("id", "bookmarktool"), i.innerHTML = n, document.body.appendChild(i);
				var r = document.getElementById("BookmarkExit");
				r.addEventListener ? r.addEventListener("click", function () {
					document.body.removeChild(i)
				}) : r.attachEvent && r.attachEvent("onclick", function () {
					document.body.removeChild(i)
				})
			}
		}
	},
	msgbox	   : function(doc,text,timeout) {
			var target = doc || document || window.document;
			if(!target) {
				return false;
			}
			var msgId = 'tombloo_services_msgbox';
			var msgbox = doc.getElementById(msgId);
			text = '<font color="red">TOMBLOO: </font>' + text;
			if(!msgbox) {
				msgbox = doc.createElement('div');
				msgbox.id = msgId;
				msgbox.addEventListener('click',function(){this.style.display='none';});
				msgbox.setAttribute('style',
					'z-index: 32768; ' 
					+'position: fixed; top: 20px;'
					+'text-align:center;display: block; padding: 10px;'
					+'background-color:#ee7;color:#000;opacity:0.8;'
				);
				target.body.appendChild(msgbox);
			}
			msgbox.innerHTML = text;
			msgbox.style.display = 'block';
			if(timeout) {
				setTimeout(function(){
					if(msgbox) {
						msgbox.style.display = 'none';
					}
				},timeout);
			}
			return true;
	},
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
				tag = joinText(ps.tags,' ');
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
				ps.gallery = true;
			}
			else {
				ps.gallery = false;
			}
			if(tag.match(/erotic/,'i')) {
				ps.erotic = true;
				ps.adult = true;
			}
			else {
				ps.erotic = false;
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
		//if(ps.type == 'photo' && ps.pageUrl.match(/^https?:\/\/[^\/]+google\./)) {
		//	ps.pageUrl = ps.pageUrl.replace(/&(authuser|oq|gs_l|newwindow|hl|biw|bih|ei)=[^&]*/g,'');
		//}
		['itemUrl','pageUrl'].forEach(function(p) {
			if(ps[p]) {
			
				//convert livedoor.blogimg.jp
				ps[p].replace(/livedoor\.blogimg\.jp/g,'image.blog.livedoor.jp');
				
				//clean google url
				if(ps[p].match(/^[^\/:]+:\/\/(?:[^\/]+\.)?google\.[^\/]+/)) {
					//alert("Google PRE  :" + ps[p]);
					ps[p] = ps[p].replace(/&(?:authuser|source|sa|oq|gs_l|ved|tbm|newwindow|hl|biw|bih|ei)=[^&#]*/g,'');
					//alert("Google POST :" + ps[p]);
				}
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
		if(template.match(/medialink/)) {
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
