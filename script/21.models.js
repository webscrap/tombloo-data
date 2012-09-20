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
	// ----- Helper functions -----
	/**
	 * スカラー型となりうる値のみ文字列として評価する
	 *
	 * @param  {Mixed}   x   任意の値
	 * @return {String}      文字列としての値
	 */
	stringify :	function (x) {
	    let result = '', c;
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
	},
};
    
if(typeof(models)=='undefined')
	this.models = models = new Repository();

models.register({
	name : '115收藏',
	ICON : 'http://sc.115.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/link|photo|text|quote/).test(ps.type);
	},
	/*
	URL=http://sc.115.com/add
	POSTDATA=url=URL&title=TITLE&desc=DESC&labels=tag1%2Ctag2
	POSTDATA=url=URL&title=TITLE&desc=DESC&labels=tag1%2Ctag2&share=1
	*/
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'firefox');//s.pre_post(oldps);
	    var tag = joinText(ps.tags, ',');
        return request('http://sc.115.com/add', {
            referrer    : ps.pageUrl,
            sendContent : {
                url         : ps.itemUrl,
                title       : ps.item,
                labels      : tag,
                desc        : ps.description,
				share		: ((ps.adult || ps.private) ? '0' : '1'),
           },
        });
	},
	
});

models.register({
	name : '百度搜藏',
	ICON : 'http://cang.baidu.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/link|photo|text|quote/).test(ps.type);
	},
	
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'firefox');
	    var tag = joinText(ps.tags, ',');
        //tag = joinText(tag.split(/\s*,\s*/),',');
		/*
        var privacy = '0';
        if(ps.adult || ps.private) {
			privacy = '1';
        }
		*/
        //POSTDATA=ct=5&iu=http%3A%2F%2Fwww.baidu.com%2Fsearch%2Fcang_tools.html&st=0&dc=DESC&it=TITLE&tn=test%2Ctest%2Cgood%2Cgoodbye%2Cok%20let's%20go&_=
        return request('http://cang.baidu.com/do/cm', {
            referrer    : ps.pageUrl,
            sendContent : {
                ct          : '5',
                iu          : ps.itemUrl,
                it          : ps.item,
                tn          : tag,
                '_'         : '',
                st          : '0',
                dc          : ps.description,
           },
        });
	},
	
});

(function() {
    var thismodel = models.Delicious;
    if(thismodel) {
		thismodel.check = function(ps){
			return true;
			return (/link|photo|text|quote/).test(ps.type);
		};
    	thismodel.ori_post = thismodel.post;
    	thismodel.post =  function(oldps){
			var ps = modelExt.createPost(oldps,'delicious');
			//var ps = oldps;
			if(ps.adult) {
				ps.private = 'true';
			}
			else if(ps.private) {
				ps.private = 'true';
			}
			else {
				ps.private = '';//'false';
			}
			return thismodel.ori_post(ps);
		};
	thismodel.getSuggestions = function(url){
		var self = this;
		var ds = {
			tags : this.getUserTags(),
			suggestions : this.getCurrentUser().addCallback(function(){
				return getPref('model.delicious.prematureSave')? 
					request('https://www.delicious.com/save', {
						queryString : {
							url : url,
						}
					}) : 
					request('https://www.delicious.com/save/confirm', {
						queryString : {
							url   : url,
							isNew : true,
						}
					});
			}).addCallback(function(res){
				var doc = convertToHTMLDocument(res.responseText);
				var elmItem        = doc.getElementById('saveTitle');
				var elmDescription = doc.getElementById('saveNotes');
				var elmTags        = doc.getElementById('saveTags');
				var elmPrivate     = doc.getElementById('savePrivate');
				return {
					editPage : 'https://www.delicious.com/save?url=' + url,
					form : {
						item        : elmItem ? elmItem.value : "",
						description : elmDescription ? elmDescription.value : "",
						tags        : elmTags ? elmTags.value.split(',') : "",
						private     : elmPrivate ? elmPrivate.checked : 0
					},
					
					duplicated : !!doc.querySelector('.saveFlag'),
					recommended : $x('id("recommendedField")//a[contains(@class, "m")]/text()', doc, true), 
				}
			})
		};
		
		return new DeferredHash(ds).addCallback(function(ress){
			var res = ress.suggestions[1];
			res.tags = ress.tags[1];
			return res;
		});
	 };
    }
    else {
    	alert('error no thismodel');
    }
})(); 

models.register({
	name : '点点',

	ICON : 'http://s.libdd.com/img/icon/favicon.$5106.ico',
	
	check : function(ps){
		return true;
		return (/(photo|link|quote)/).test(ps.type);
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	upload : function(ps) {
//	URL=http://www.diandian.com/share?ti=Kanye%20%26%20Kim%20Kardashian%20Courtside%20Cuddling%20At%20The%20Lakers%20Playoff%20Game%20%7C%20Necole%20Bitchie.com&lo=http%3A%2F%2Fnecolebitchie.com%2F2012%2F05%2F13%2Fkanye-kim-mania-at-the-lakers-game%2F&f=1&type=image&src[0]=http%3A%2F%2Fnecolebitchie.com%2Fwp-content%2Fuploads%2F2012%2F05%2FKim-Kanye-Lakers-Game.jpg
		var apiurl = 'http://www.diandian.com/share';///v2?tmp=' + (+new Date);
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : {
					ti			: ps.item,
					lo			: ps.pageUrl,
					f			: '1',
					type		: 'image',
					'src[0]'	: ps.itemUrl,
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			log(r);
			if(r) {
				var blogid;
				var photo;
				var formkey;
			/*
			//login:
				if(r.indexOf("diandian.com/login")) {
					log(r);
					throw new Error(getMessage('error.notLoggedin'));
				}
			*/
				var m = r.match(/\{value:"([^"]+)",\s*isPrivace:"1"/);
				if(!m) {
					m = r.match(/ENV\.blogUrl\s*=\s*'([^']+)/);
				}
				if(m) {
					blogid = m[1];
				}
				else {
					throw new Error("No post_blog found");
				}
				//m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				m = r.match(/{"id":"([^"]+)","desc"/);
				if(m) {
					photo = m[1];
				}
				else {
					throw new Error("Upload failed");
				}
				m = r.match(/window.DDformKey\s*=\s*'([^']+)/);
				if(m) {
					formkey = m[1];
				}
				else {
					throw new Error("No formKey found! Request failed.");
				}
				return {formkey:formkey,blogid:blogid,photo:photo,referer:apiurl};
			}
			else {
					throw new Error("Server not responsed.Can't upload the picture");
			}
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'tumblr-file');
	    var tag = joinText(ps.tags, ',');
		if(ps.type == 'photo') {
			return this.upload(ps).addCallback(function(data) {
				if(data) {
					var actionUrl = 'http://www.diandian.com/dianlog/' + data.blogid + '/new/photo';
					var source = xUtils.escapeCode(ps.pageUrl);
					return request(actionUrl,{
						referrer	: data.referer,
						'X-Requested-With' : 'XMLHttpRequest',
		                sendContent : {
							formKey		: data.formkey,
							title		: ps.item,
							tags		: tag,
							desc		: ps.description,
							layout		: '1',
							photos		: '[{"id":"' + data.photo + '","desc":"' + ps.item + '"}]',
							uri			: '',
							shareSource	: ps.pageUrl,
							privacy		: (ps.private || ps.adult) ? '2' : '0',
							setTop		: 'false',
							syncToWeibo	: "false",
							syncToQqWeibo	: "false",
							syncToDouban	: "false",
							syncToQzone	: "false",
							syncToRenren	: "false",
							syncToFacebook	: "false",
							syncToTwitter	: "false",
							syncToFlickr	: "false",
						},
					});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else if(ps.type == 'link') {
			throw new Error(ps.type + ' is not supported.');
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	
});


update(models['FirefoxBookmark'], {
	check: function(ps){
		return true;
		return (/(photo|quote|link)/).test(ps.type);
	},
	ori_post: models['FirefoxBookmark'].post,
	post: function(oldps) {
		var ps = modelExt.createPost(oldps,'firefox');
		return models['FirefoxBookmark'].ori_post(ps);
	},
});


(function() {
	if(models.Flickr) {
	var thismodel = models.Flickr;
	thismodel.ori_post = thismodel.post;
	thismodel.post = function(oldps){
		var ps = modelExt.createPost(oldps);
		var tags = joinText(ps.tags, ' ');
		var desc = ps.description || '';
		if(tags.match(/reupload/)) {
			desc = 'src{' + ps.itemUrl + '}\npage{' + ps.pageUrl + '}\ntitle{' + ps.item + '}';
		}
		return (ps.file? succeed(ps.file) : download(ps.itemUrl, getTempFile())).addCallback(function(file){
			return models.Flickr.upload({
				photo       : file,
				title       : ps.item || ps.page || '',
				description : desc,
				is_public   : ps.private? 0 : 1,
				tags        : tags,
			});
		});
		};
	}
})();

    
models.register({
	name : 'GirlFound',
	ICON : 'http://www.girlfound.com/favicon.ico',
	
	check : function(ps){
		return ps.type.match(/quote|photo/) && !ps.file;
	},
	/*
	Referer=http://www.girlfound.com/post/?uri=http%3A%2F%2Fwww.zq.sd.cn%2Ftp%2Fnews%2F200807%2F2008-7-23_17474865213.jpg&title=%E7%99%BE%E5%BA%A6%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2_Vol.385%20Momoko%20Tani%20%E8%B0%B7%E6%A1%83%E5%AD%90&loc=http%3A%2F%2Fimage.baidu.com%2Fi%3Ftn%3Dbaiduimage%26ct%3D201326592%26lm%3D-1%26cl%3D2%26word%3DVol.385%2520Momoko%2520Tani%2520%25B9%25C8%25CC%25D2%25D7%25D3
	POSTDATA=item_title=TITLE&item_tags=tag1%2Ctag2&item_image=http%3A%2F%2Fwww.zq.sd.cn%2Ftp%2Fnews%2F200807%2F2008-7-23_17474865213.jpg&item_source=http%3A%2F%2Fimage.baidu.com%2Fi%3Ftn%3Dbaiduimage%26ct%3D201326592%26lm%3D-1%26cl%3D2%26word%3DVol.385%2520Momoko%2520Tani%2520%25B9%25C8%25CC%25D2%25D7%25D3
	
	URL=http://www.girlfound.com/add/item/
	*/
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
		var tag = joinText(ps.tags, ',');
        return request('http://www.girlfound.com/add/item/', {
            referrer    : 'http://www.girlfound.com/post/?uri=' + ps.itemUrl + '&title=' + ps.item + '&loc=' + ps.pageUrl,
            sendContent : {
                item_image  : ps.itemUrl,
                item_title  : ps.item,
                item_tags   : tag,
				item_source	: ps.pageUrl,
           },
        });
	},
	
});


models.register({
	name : '花瓣',
	ICON : 'http://huaban.com/favicon.ico',
	check : function(ps){
		return (ps.type == 'photo' && !ps.file);
	},
	getid : function(ps) {
//	URL=http://huaban.com/bookmarklet/?media=http%3A%2F%2Fimg.ikeepu.com%2Fimg%2F30%2F11%2F90%2F634727053504676223.jpg_500&url=http%3A%2F%2Fikeepu.com%2F&w=500&h=500&alt=&title=%E6%94%B6%E8%97%8F%E5%96%9C%E6%AC%A2%EF%BC%8C%E5%88%86%E4%BA%AB%E4%B9%90%E8%B6%A3%20-%20%E7%88%B1%E5%BA%93%E7%BD%91%20Beta&description=&media_type=&video=&
		var apiurl = 'http://huaban.com/bookmarklet/';
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : {
					media		: ps.itemUrl,
					url			: ps.pageUrl,
					title		: ps.item,
					alt			: '',
					description	: '',
					media_type	: '',
					video		: '',
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			if(r) {
				var id;
				var m = r.match(/"board_id"\s*:\s*(\d+)/);
				if(m) {
					id = m[1];
				}
				else {
					throw new Error("No board_id found, please login first.");
				}
				return {id:id,referer:apiurl};
			}
			else {
					throw new Error("Server not responsed.");
			}
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
	    var tag = joinText(ps.tags, ',');
		if(ps.type == 'photo') {
/*		
URL=http://huaban.com/pins/
board_id=799063
text=忙聰露猫聴聫氓聳聹忙卢垄茂录聦氓聢聠盲潞芦盲鹿聬猫露拢 - 莽聢卤氓潞聯莽陆聭 Beta
weibo=true
via=2
media_type=0
video=0
img_url=http://img.ikeepu.com/img/30/11/90/634727053504676223.jpg_500
link=http://ikeepu.com/
is_share_btn=
*/
			return this.getid(ps).addCallback(function(data) {
				if(data) {
					var actionUrl = 'http://huaban.com/pins/';
					return request(actionUrl,{
						referrer	: data.referer,
						'X-Requested-With' : 'XMLHttpRequest',
		                sendContent : {
							board_id	: data.id,
							//weibo		: 'false',
							via			: '1',
							media_type	: '0',
							video		: '0',
							img_url		: ps.itemUrl,
							link		: ps.pageUrl,
							text		: ps.item + "\n\n" + ps.description,
							is_share_btn: '',
							share_button:	'1024',
						},
					});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	
});



    
models.register({
	name : '爱库',
	ICON : 'http://www.ikeepu.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/(photo|link|quote)/).test(ps.type);
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			return 1;
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'ikeepu+video');
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),' ');
        var privacy = '0';
        var sync = 'sina';
        var category = '';
        if(ps.adult || ps.private) {
            privacy = '1';
            sync = '';
        }

/*
 
URL=http://ikeepu.com/apps/bookmark/add

from=BOOKMARK.1.0
sid=10179480
url=http%3A%2F%2Fikeepu.com%2Fapp%2F20
type=page
referer=http%3A%2F%2Fikeepu.com%2Fapp%2F20
thumb=
cod_hack=%E2%84%A2
title=TITLE
category=
tag=tag1+tag2+
privacy=1
sync=sina
description=DESC
*/
		//var actionUrl = 'http://ikeepu.com/me/keep';
		var actionUrl = 'http://ikeepu.com/apps/bookmark/add';
        if(ps.type == 'photo') {
            return this.request(actionUrl, {
                referrer    : ps.pageUrl ,
                sendContent : {
					from		: 'BOOKMARK.1.0',
					cod_hack	: unescape('%E2%84%A2'),
					sid			: '0',
                    url         : ps.pageUrl + '#' + ps.itemUrl,
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
                    description : ps.description,
                    type        : ps.gallery ? 'page' : 'image',
                    thumb       : ps.itemUrl,
					referer		: ps.pageUrl,
               },
            });
        }
		else if (ps.type == 'video') {
			var embed = ps.body;
			var dom = convertToHTMLDocument(embed); 
			embed = dom.getElementsByTagName('embed')[0];
			if(!embed) {
				embed = dom.getElementsByTagName('object')[0];
			}
			//url=http://static.youku.com/v1.0.0188/v/swf/player.swf||VideoIDS=XMzAxMzQ0NTMy&ShowId=0&Cp=0&Light=on&THX=off&Tid=0&isAutoPlay=true&Version=/v1.0.0705&show_ce=1&winType=interior
			var url = embed.getAttribute('src') + '||';
			var attrs = new Array();
			for(var i=0;i<embed.attributes.length;i++) {
				var attr = embed.attributes[i];
				if(attr.name.match(/src/)) {
				}
				else {
					attrs.push(attr.name + '=' + attr.value);
				}
			}
			url = url + attrs.join('&');
            return this.request(actionUrl, {
                referrer    : ps.pageUrl,
				sendContent : {
					from		: 'BOOKMARK.1.0',
					cod_hack	: unescape('%E2%84%A2'),
					sid			: '0',
                    url         : url,
					referer		: ps.pageUrl,
					thumb		: '',
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
                    description : ps.description,
                    type        : 'video',
               },
            });
		}
        else {
            return this.request(actionUrl, {
                referrer    : ps.pageUrl,
				sendContent : {
					from		: 'BOOKMARK.1.0',
					cod_hack	: unescape('%E2%84%A2'),
					sid			: '0',
                    url         : ps.pageUrl,
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
					referer		: ps.pageUrl,
					thumb		: '',
                    description : ps.description,
                    type        : 'page',
               },
            });
        }
	},
	
});

    
models.register({
	name : 'ImgFave',
	ICON : 'http://imgfave.com/favicon.ico',
	
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(oldps){
        var privacy = '0';
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
        if(ps.adult || ps.private) {
            privacy = '1';
        }
		var tag = joinText(ps.tags, ',');
		/*
        POSTDATA=
		i=http%3A%2F%2Freubenmiller.typepad.com%2F.a%2F6a00d8341ca70953ef01538e18d247970b-500wi
		&t=ShareSomeCandy
		&u=http%3A%2F%2Fwww.sharesomecandy.com%2F
		&n=1
		&tags=tag1%2Ctag2
		*/
		/*
		X-Requested-With=XMLHttpRequest
		*/
        return request('http://imgfave.com/items/additem', {
            referrer    : ps.pageUrl,
			'X-Requested-With'	: 'XMLHttpRequest',
            sendContent : {
				i		:	ps.itemUrl,
				t		:	ps.item,
				u		:	ps.pageUrl,
				n		:	privacy,
				tags	:	tag,
           },
        });
	},
	
});
    
models.register({
	name : 'Piccsy',
	ICON : 'http://piccsy.com/favicon.ico',
	
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
	    var tag = new String(encodeURI(joinText(ps.tags, ',')));
		tag = tag.substr(0,94).replace(/%/,'');
		var nsfw = false;
        if(ps.adult || ps.private) {
            nsfw = true;
        }	
		/*
image_link=http%3A%2F%2Fcdnimg.visualizeus.com%2Fthumbs%2F51%2Fcb%2F51cb543efbe2fce7bc1b4839c0f4f176_m.jpg
pop_tag_photography=on
pop_tag_nsfw=on
title=Title
description=Description
src_url=http%3A%2F%2Fvi.sualize.us%2F
new_tags=tag1%2Ctag2
publish=1
bookmark=1
radio_privacy=2
submit=Create+new+post

		*/
		var dir = 'http://piccsy.com/post/create/new/';
		var vpublic	= nsfw ? '2' : '1';
		var vnsfw	= nsfw ? 'on' : 'off';
		var postcontent = {
				title			:	(new String(encodeURI(ps.item))).substr(0,94),
				description		:	ps.description,
				src_url			:	ps.pageUrl,
				image_link		:	ps.itemUrl,
				new_tags			:	tag,
				submit			:	'Create+new+post',
				pop_tag_photography	:	'on',
				'publish'			:	'1',
				bookmark			:	'1',
				radio_privacy		:	vpublic,
        };
		if(nsfw) {
			postcontent.pop_tag_nsfw = 'on';
		}
        return request(dir ,  {
            referrer    : ps.pageUrl,
			sendContent : postcontent,
        });
	},
	
});


models.register({
	name : 'TomblooBridge',
	ICON : 'chrome://tombloo/skin/local.ico',
	
	
	check : function(ps){
		return (/(regular|photo|quote)/).test(ps.type);
	},

	post : function(oldps){
		var ps = modelExt.createPost(oldps);
	    var tag = joinText(ps.tags, ',');
		var process = new Process(new LocalFile('/myplace/bin/tombloo-bridge'));
		var profd =  DirectoryService.get('ProfD', IFile).path;
		var args = [
				"item=>" + ps.item,
				'type=>' + ps.type,
				'itemUrl=>' + ps.itemUrl,
				'pageUrl=>' + ps.pageUrl,
				'tags=>' + joinText(ps.tags,","),
				'description=>' + (ps.description || ""),
				'file=>'+ (ps.file ? ps.file.path : ""),
				'profd=>' + profd,
				'body=>' + ps.body,
				'private=>' + (ps.private ? '1' : '0'),
				'adult=>' + (ps.adult ? '1' : '0'),
		];
		var file = getTempFile('txt');	
		putContents(file,joinText(args,"\n"),'UTF8');
/*		
		if(ps.body && ps.body.length > 100) {
			var file = getTempFile('txt');	
			putContents(file,joinText(args,"\n"),'UTF-16');
			var outs =  new FileOutputStream(file,FileOutputStream.PR_WRONLY | FileOutputStream.PR_CREATE_FILE | FileOutputStream.PR_TRUNCATE, 420, -1);
			outs.write(ps.body,ps.body.length);
			outs.close();
			args.push('body-file=>'+file.path);
		}
		else {
			args.push('body=>' + ps.body);
		}
*/
		process.run(
			false,
			[file.path],
			1
			);
		return succeed();
	},
});

    
models.register({
	name : '推它',

	ICON : 'http://www.tuita.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/(photo|link|quote)/).test(ps.type);
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	upload : function(ps) {
		var apiurl = 'http://www.tuita.com/share/v2?tmp=' + (+new Date);
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				sendContent	: {
					data	: '{"type":"photo","info":[{"img":"' + xUtils.escapeCode(ps.itemUrl) + '","alt":""}],"title":"' + ps.item + '","location":"' + xUtils.escapeCode(ps.pageUrl) + '"}',
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			if(r) {
				var blogid;
				var photo;
			/*
			//login:
				if(r.indexOf("tuita.com/login")) {
					log(r);
					throw new Error(getMessage('error.notLoggedin'));
				}
			*/
				var m = r.match(/"post_blog":"(\d+)"/);
				if(m) {
					blogid = m[1];
				}
				else {
					throw new Error("No post_blog found");
				}
				//m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				m = r.match(/"photo_url"\s*:\s*"([^"]+)/);
				if(m) {
					photo = m[1];
				}
				else {
					throw new Error("Upload failed");
				}
				return {blogid:blogid,photo:photo,referer:apiurl};
			}
			else {
					throw new Error("Server not responsed.Can't upload the picture");
			}
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'tumblr-file+video');
		modelExt.assertFalse(ps,{'adult':false,'private':false});
	    var tag = joinText(ps.tags, ',');
		var actionUrl = 'http://www.tuita.com/post/create';
		return this.upload(ps).addCallback(function(data) {
			if(data) {
				var source = xUtils.escapeCode(ps.pageUrl);
				return request(actionUrl,{
					referrer	: data.referer,
					'X-Requested-With' : 'XMLHttpRequest',
	                sendContent : {
						post_title	: ps.item,
						post_tag	: tag,
						sync_flag	: '0',
						sticky		: '0',
						from		: 'home',
						dtime		: 'null',
						source		: 'shareBookmark',
						post_extend : '{"share_source":"' + source + '","share_url":"' + source + '"}',
						post_type	: 'photoset',
						blog_id		: data.blogid,
						//post_content: '[{' + data.photo + '}]',
						post_content: '[{"photo_url":"' + data.photo + '","photo_text":"' + ps.item + '","exif":"","layout":"","desc":"' + ps.description + '"}]',
					},
				});
			}
//        if(ps.type == 'photo') {
            return request(actionUrl, {
	            referrer		: 'http://www.tuita.com/myblog/afun/new/blog/?from=http%3A%2F%2Fwww.tuita.com%2Fmyblog%2Fafun',
				'X-Requested-With' : 'XMLHttpRequest',
                sendContent : {
                    post_content : xUtils.escapeCode('<P><BR/><IMG data-mce-src="' + ps.itemUrl + '" alt="" src="' + ps.itemUrl + '"/></P><P><BR/>Source: <A data-mce-href="' + ps.pageUrl + '" href="' + ps.pageUrl + '" title="' + (ps.description || ps.itemUrl) + '" target="_blank">' + ps.pageUrl + '</A><BR/></P>'),
                    post_title   : ps.item,
                    post_tag     : tag,
					sync_flag	 : '0',
					sticky		: '0',
					from		: 'home',
					dtime		: 'null',
					post_type	: 'blog',
					blog_id		: '1483648926',
               },
            });
		});
	},
	
});

models.Tumblr.post = function(oldps){
		var self = this;
		var ps = modelExt.createPost(oldps,'tumblr+video');
		var endpoint = Tumblr.TUMBLR_URL + 'new/' + ps.type;
		return this.postForm(function(){
			return self.getForm(endpoint).addCallback(function(form){
				var frm = Tumblr[ps.type.capitalize()].convertToForm(ps);
				frm['post[source_url]'] = ps.pageUrl;
				update(form, frm);
				self.appendTags(form, ps);
				return request(endpoint, {sendContent : form});
			});
		});
	};

modelExt.hookModel('Tumblr','tumblr+video');

    
models.register({
	name : 'Visualizeus',
	ICON : 'http://vi.sualize.us/favicon.ico',
	
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
	    var tag = joinText(ps.tags, ',');
        var nsfw = false;
        if(ps.adult) {
            nsfw = true;
        }
		var user = getCookieString('vi.sualize.us','VISUALIZEUS-login');
		if(user) {
			user = (new String(user.toString())).replace(/%.*$/,'');
			user = user.replace(/^.*=/,'');
		}
		var dir = 'http://vi.sualize.us/' + user + '/'; //?action=add
		var vpublic	= nsfw ? '' : (ps.private ? '' : 'public');
		var vnsfw	= nsfw ? 'nsfw' : '';
		var status	=	nsfw ? '2'	:	'0';
        return request(dir + '?action=add',  {
            referrer    : ps.pageUrl,
			'X-Requested-With'	: 'XMLHttpRequest',
            sendContent : {
				referrer		:	dir + '?action=add',
				//action			:	'add',
				title			:	ps.item,
				//description		:	ps.description,
				referenceURL	:	ps.pageUrl,
				address			:	ps.itemUrl,
				tags			:	tag,
				//fauxTags		:	'',
				submitted		:	'submitted',
				'status'		:	status,
				'nsfw'			:	vnsfw,
				'public'		:	vpublic,
           },
        });
	},
	
});

    
models.register({
	name : 'WebSaver',
	ICON : 'chrome://tombloo/skin/local.ico',
	
	
	check : function(ps){
		return (/(regular|photo|quote)/).test(ps.type);
	},
	
	allDir : xUtils.getDir('all'),

	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
	    var tag = joinText(ps.tags, ',');
		if(ps.type=='photo'){
			return this.postPhoto(ps,this.allDir);
		} else {
			var file = createDir(this.allDir);
			//xUtils.getDir('all');
			file.append(ps.item + ".txt");
			return this.append(file,ps);
		}
	},
	
	tagfs : function(file,tags) {
			var topDir = xUtils.getDir().path;
			var process = new Process(new LocalFile('/myplace/workspace/perl/tagfs'));
			process.run(false, ['-r',topDir,joinText(tags,","),file.path],4);
	},

	append : function(file, ps){
		clearCollision(file);
		putContents(
			file,
			joinText(
				[
					ps.item,
					ps.description,
					ps.body, 
					ps.itemUrl, 
					ps.pageUrl, 
					"[ " + joinText(ps.tags, ', ') + " ]"
				],
				'\n\n', 
				true)
			);
		return succeed().addCallback(function(){
			return file;
		}).addCallback(function(){
			var topDir = xUtils.getDir().path;
			var process = new Process(new LocalFile('/myplace/workspace/perl/tagfs'));
			process.run(false, ['-r',topDir,joinText(ps.tags,","),file.path],4);
		});
	},
	
	postPhoto : function(ps,allDir){
		var file = createDir(allDir);
		//createDir(file);
		
		if(ps.file){
			file.append(ps.item + "_" + ps.file.leafName);
		} 
		else {
			var uri = ps.itemUrl ? createURI(ps.itemUrl) : createURI(ps.pageUrl);
			var fileName = validateFileName(ps.item + "_" + uri.fileName);
			file.append(fileName);
		}
		clearCollision(file);
		return succeed().addCallback(function(){
			if(ps.file){
				ps.file.copyTo(file.parent, file.leafName);
				return file;
			} else {
				return download(ps.itemUrl, file);
			}
		}).addCallback(function(){
			var topDir = xUtils.getDir().path;
			var process = new Process(new LocalFile('/myplace/workspace/perl/tagfs'));
			process.run(false, ['-r',topDir,joinText(ps.tags,","),file.path],4);
		});
	},
	
});

update(models.WeHeartIt,{
	check : function(ps){
		return ps.type.match(/photo|quote/)  && !ps.file;
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
		if(!this.getAuthCookie())
			return fail(new Error(getMessage('error.notLoggedin')));
		return request(this.URL + 'create_entry/', {
			redirectionLimit : 0,
			referrer : ps.pageUrl,
			queryString : {
				via   : ps.pageUrl,
				title : ps.item,
				media   : ps.itemUrl,
                tags : joinText(ps.tags, ','),
			},
        });
	},
	getAuthCookie : function(){
        //return 1;
		// ¥¯¥Ã¥­©`¤ÎÓ×÷¤¬²»°²¶¨¤Ê¤¿¤á2¤Ä¤ò¥Á¥§¥Ã¥¯¤·ÕæÎ¤ò·µ¤¹
		return getCookieString('weheartit.com', 'auth');
	},
});

    
models.register({
	name : '有道书签',
	ICON : 'http://shared.ydstatic.com/images/favicon.ico',
	
	check : function(ps){
		return true;
		//return (/link|photo|text|quote|video|conversation/).test(ps.type);
	},
	/*
	URL=http://shuqian.youdao.com/manage?a=add
	POSTDATA=title=TITLE&url=http%3A%2F%2FURL&tags=TAG1%2CTAG2&note=DESC%0D%0ADESC
	*/
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'firefox');
	    var tag = joinText(ps.tags, ',');
        return request('http://shuqian.youdao.com/manage?a=add', {
            referrer    : ps.pageUrl,
            sendContent : {
                url         : ps.itemUrl,
                title       : ps.item,
                tags        : tag,
                note        : ps.description || ps.body || ps.pageUrl,
           },
        });
	},
	
});

models.register({
	name : 'Zootool',
	ICON : ' https://zootool.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/link|photo|quote/).test(ps.type);
	},
	getInfo : function(ps){
		return request('https://zootool.com/post/item/',{
							referrer	:	ps.pageUrl,
							queryString	:	{
								iframe	:	'true',
								url		:	ps.itemUrl,
								title	:	ps.item,
								referer	:	ps.pageUrl,
							},
		}).addCallback(function(res){
			var dom = convertToHTMLDocument(res.responseText);
			//alert(dom);
			var inputs = dom.getElementsByTagName('input');
			//alert(inputs.length);
			var r = {};//{id:'',uid:'',referer:'',type:'',subtype:'',inthezoo:'',source:'','public':'',iframe:'',action:''}
			for(var i=0;i<inputs.length;i++) {
				r['' + inputs[i].name] = inputs[i].value;	
			}
			//alert(r);
			return r;
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'ikeepu');
	    var tag = joinText(ps.tags, ',');
        var ispublic = 'y';
        if(ps.adult || ps.private) {
            ispublic = 'n';
        }
		//URL=http://zootool.com/post/item/?iframe=true&url=http%3A%2F%2Fwww.poco.cn%2F&title=POCO.CN-%E6%88%91%E7%9A%84%E7%85%A7%E7%89%87%EF%BC%8C%E6%88%91%E7%9A%84%E7%A9%BA%E9%97%B4%EF%BC%81%20%E4%B8%AD%E5%9B%BD%E7%AC%AC%E4%B8%80%E5%9B%BE%E7%89%87%E7%A4%BE%E5%8C%BA%20%E4%B8%AA%E4%BA%BA%E7%A9%BA%E9%97%B4%20%E7%94%B5%E5%AD%90%E6%9D%82%E5%BF%97%20%E5%90%8C%E5%9F%8E%E6%B4%BB%E5%8A%A8&referer=http://www.poco.cn/
		//POSTDATA=loading=Please%2C%20wait%20a%20second&title=Baidu&tags=test&email_to=&loading=Sending%20email&id=2653683&uid=sza7&referer=http%3A%2F%2Fbaidu.com&type=page&subtype=baidu&inthezoo=n&type=page&source=lasso&public=y&iframe=&action=add&description=desc&email_body=http%3A%2F%2Fzoo.tl%2Fsza7

		return this.getInfo(ps).addCallback(function(info){
			request('http://zootool.com/post/actions/',{
				referrer		:	ps.pageUrl,
				sendContent		:	{
					loading		:	'Please wait 20 second',
					title		:	ps.item,
					tags		:	tag,
					email_to	:	'',
					loading		:	'Sending email',
					id			:	info.id,
					uid			:	info.uid,
					referer		:	ps.pageUrl,
					type		:	info.type,
					subtype		:	info.subtype,
					inthezoo	:	info.inthezoo,
					source		:	info.source,
					iframe		:	info.iframe,
					'public'	:	ispublic,
					action		:	info.action,
					description	:	ps.description || ps.item,
					email_body	:	'http://zoo.tl/' + info.uid,
				},
			});
		});
	},
});


models.register({
	name : 'Pinterest',

	ICON : 'http://pinterest.com/favicon.ico',
	
	check : function(ps){
		return true;
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	upload : function(ps) {
		var apiurl = 'http://pinterest.com/pin/create/bookmarklet/';
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : {
					media		: ps.itemUrl,
					url			: ps.pageUrl,
					title		: ps.item,
					is_video	: ps.type == 'video' ? 'true' : 'false',
					description	: ps.description,
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			log(r);
			if(r) {
				var boardid;
				var token;
				var form_url;
				var m = r.match(/id="id_board"[^>]+value="(\d+)"/);
				if(m) {
					boardid = m[1];
				}
				else {
					throw new Error("No BOARD found for posting");
				}
				//m = r.match(/{\s*("photo_url"[^}]+)\s*}/);
				m = r.match(/name='csrfmiddlewaretoken'[^>]+value='([^']+)/);
				if(m) {
					token = m[1];
				}
				else {
					throw new Error("No posting TOKEN found.");
				}
				m = r.match(/name="form_url"[^>]+value="([^"]+)/);
				if(m) {
					form_url = m[1];
				}
				else {
					throw new Error("No FORM_URL found! Request failed.");
				}
				return {id:boardid,token:token,form:form_url};
			}
			else {
					throw new Error("Server not responsed.Can't pin.");
			}
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
	    var tag = joinText(ps.tags, ',');
		var tag_text = joinText(ps.tags,' #');
		if(tag_text) {
			tag_text = '[#' + tag_text + ']';
		}
		if(ps.type == 'photo') {
			return this.upload(ps).addCallback(function(data) {
/*
			caption=TEXTBODY #a #b #c
			board=370421206790179979
			tags=a,b,c
			replies=
			buyable=
			title=img1_src_5803249.jpg (JPEG Image, 957Â ÃÂ 700 pixels)
			media_url=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg
			url=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg
			via=
			csrfmiddlewaretoken=7efc27d396eecd8f63f1109feec08493
			form_url=/pin/create/bookmarklet/?media=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg&url=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg&title=img1_src_5803249.jpg%20(JPEG%20Image%2C%20957%C2%A0%C3%97%C2%A0700%20pixels)&is_video=false&description=http%3A%2F%2Fimg1.moko.cc%2Fusers%2F0%2F4%2F1409%2Fface%2Fimg1_src_5803249.jpg
*/
				if(data) {
				var actionUrl = 'http://pinterest.com/pin/create/bookmarklet/';
					return request(actionUrl,{
						referrer	: data.referer,
						'X-Requested-With' : 'XMLHttpRequest',
		                sendContent : {
							caption		: ps.item + "\n" + ps.description + "\n" + tag_text,
							board		: data.id,
							tags		: tag,
							replies		: '',
							buyable		: '',
							title		: ps.item,
							media_url	: ps.itemUrl,
							url			: ps.pageUrl,
							via			: '',
							csrfmiddlewaretoken	: data.token,
							form_url	: data.form,
						},
					});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else if(ps.type == 'link') {
			throw new Error(ps.type + ' is not supported.');
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	
});

models.register({
	name : '轻微博',

	ICON : 'http://qing.weibo.com/favicon.ico',
	
	check : function(ps){
		return true;
		return (/(photo)/).test(ps.type);
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	upload : function(ps) {
		
		function checkuploadpic(key) {
			var check_url ='http://qing.weibo.com//blog/api/checkuploadpic.php';
			return request(check_url,{
					referrer	: 'http://qing.weibo.com/blog/controllers/capture.php',
					queryString	:	{
						'key'	:	key,
						'varname':	'data',
					},
				}
			).addCallback(function(cr) {
				cr = cr.responseText;
				log(cr);
				if(cr) {
					if(cr.match(/"code":"A00006"/)) {
						var m = cr.match(/:"(http:[^"]+sinaimg\.cn[^"]+)/);
						if(m) {
							return m[1];
						}
						else {
							var m = cr.match(/:"-1"/);
							if(!m) {
								return checkuploadpic(key);
							}
						}
					}
				}
				throw new Error("Upload images failed." + "\n" + cr);
			});
		}

		/*
		 URL=http://qing.weibo.com//blog/api/uploadpic.php?imgurl[0]=http://img1.moko.cc/users/0/4/1409/logo/img1_des_6371738.jpg&imgurl[1]=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg&r=0.9654538532879774
		 URL=http://qing.weibo.com//blog/api/uploadpic.php?imgurl[0]=http://img1.moko.cc/users/0/4/1409/face/img1_src_5803249.jpg&r=0.20445356635301726

		 host=http://www.moko.cc/frieda/
		 */
		var apiurl = 'http://qing.weibo.com/blog/api/uploadpic.php';
		return request(apiurl, {
				referrer	: 'http://qing.weibo.com/blog/controllers/capture.php',
				queryString : {
					'imgurl[0]' : ps.itemUrl,
					'r'			: '0.6328942688406815',
				},
				sendContent:	{
					host	:	ps.pageUrl,
				},
			}	
		/*
		 {"code":"A00006","message":"upload_into_queue","data":{"key":"050d2bc4b32cb0aafc4103f26b703dd6","data":["http:\/\/img1.moko.cc\/users\/0\/4\/1409\/face\/img1_src_5803249.jpg"]}}
		 */
		).addCallback(function(res) {
			var r = res.responseText;
			log(r);
			if(r) {
				var key;
				var m = r.match(/"key":"([^\"]+)"/);
				if(m) {
					key = m[1];
					return checkuploadpic(key);
				}
/*
		URL=http://qing.weibo.com//blog/api/checkuploadpic.php?key=050d2bc4b32cb0aafc4103f26b703dd6&varname=requestId_78459659
		{"code":"A00006","message":"\u67e5\u8be2\u7ed3\u679c","data":{"http:\/\/img1.moko.cc\/users\/0\/4\/1409\/face\/img1_src_5803249.jpg":"http:\/\/ww1.sinaimg.cn\/mw600\/a823ad9cjw1dwoi43e9upj.jpg"}}
*/
			}
			else {
					throw new Error('Can not upload images.' + "\n" + r);
			}
		});
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'tumblr-file+video');
//		modelExt.assertFalse(ps,{'adult':true,'private':true});
//		var tag;
		if(ps.tags && ps.tags.length > 5) {
			tag = joinText([
					ps.tags[0],
					ps.tags[1],
					ps.tags[2],
					ps.tags[3],
					ps.tags[4]
				],',');

		}
		else {
			tag = joinText(ps.tags, ',');
		}
		if(ps.type == 'photo') {
			return this.upload(ps).addCallback(function(data) {
/*
 URL=http://qing.weibo.com//blog/api/picpost.php?from_type=capture

	pid=a823ad9cjw1dwohjxnxcuj
	title=TEXT
	photos=[{"img":"http://ww2.sinaimg.cn/mw600/a823ad9cjw1dwohjxnxcuj.jpg","desc":""},{"img":"http://ww4.sinaimg.cn/mw600/a823ad9cjw1dwohjymlq5j.jpg","desc":""}]
	privacy=0
	tag=tag1,tag2
	type=pic
	pub=0
	desc_all=æ¶éèªwww.moko.cc

D=o[0].img.substring(o[0].img.indexOf("mw600/")+6,o[0].img.lastIndexOf("."))

*/
				var tag_text = (ps.tags) ? "#" + joinText(ps.tags,"#, #") + "#" : '';
				if(data) {
					var pid=data.substring(data.indexOf("mw600\\\/")+7,data.lastIndexOf("."));
					var actionUrl = 'http://qing.weibo.com//blog/api/picpost.php?from_type=capture';
					return request(actionUrl,{
						referrer	: 'http://qing.weibo.com/blog/controllers/capture.php',
						'X-Requested-With' : 'XMLHttpRequest',
		                sendContent : {
							pid			: pid,
							title		: ps.item,
							photos		: '[{"img":"' + data + '","desc":""}]',
							privacy		: '1',
							tag			: ps.private ? tag : tag,
							type		: 'pic',
							pub			: ps.private ? 'draft' : '0',
							desc_all	: ps.description + " " + tag_text,
						},
					}).addCallback(function(res) {
						var r = res.responseText;
						if(r.match(/"code":"A00006"/)) {
							return res;
						}
						throw new Error("Can not post images.\n" + r);
					});
				}
				else {
					throw new Error('No photo found');
				}
			});
		}
		else if(ps.type == 'link') {
			throw new Error(ps.type + ' is not supported.');
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	
});

modelExt.hookModel('GoogleBookmarks','firefox','link|photo|video|text');

if(models.Twitpic) {
	models.Twitpic.ICON = 'https://twitpic.com/favicon.ico';
	models.Twitpic.POST_URL = 'https://twitpic.com/upload';
	modelExt.hookModel('Twitpic','weheartit');
}

modelExt.hookModel('Twitter','weibo');



update(models.StumbleUpon, {
	check	: function(ps) {
		if(ps.type == 'photo' || ps.type == 'link') {
			return true;
		}
	}
});

models.register({
	name	: '微刊',
	ICON	: 'http://kan.weibo.com/favicon.ico',
	URL		: 'http://kan.weibo.com/',
	check	: function(ps) {
		return ps.type == 'photo';
	},
	Photo	: {
		convertToForm: function(ps) {
			return {
				title	: ps.item,
				body	: ps.description + "\n" + xUtils.toWeiboText(ps.tags),
			}
		},
	},
	post : function(oldps){
		var self = this;
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
		//URL=http://kan.weibo.com/editwithplugin?title=%E6%88%91%E7%9A%84%E5%BE%AE%E5%8D%9A%20%E6%96%B0%E6%B5%AA%E5%BE%AE%E5%8D%9A-%E9%9A%8F%E6%97%B6%E9%9A%8F%E5%9C%B0%E5%88%86%E4%BA%AB%E8%BA%AB%E8%BE%B9%E7%9A%84%E6%96%B0%E9%B2%9C%E4%BA%8B%E5%84%BF&referrer=http%3A%2F%2Fwww.weibo.com%2Fsesadit%2Fprofile%3Fleftnav%3D1%26wvr%3D3.6%26mod%3Dpersonnumber&medias=[%22http%3A%2F%2Ftp1.sinaimg.cn%2F2820910492%2F180%2F40000413578%2F1%22]&editType=3
		var editor = self.URL + 'editwithplugin';
//URL=http://kan.weibo.com/aj/kandian/addsimple?__rnd=1347471754089
		var endpoint = self.URL + 'aj/kandian/addsimple';
		return self.getForm(editor,ps).addCallback(function(form) {
			update(form, self[ps.type.capitalize()].convertToForm(ps));
			return request(endpoint, {
				referrer:	editor,
				queryString: {
					'__rnd' : form._jsKey,
				},
				sendContent: form,
			});
		});

	},
	
	getWid	: function(key) {
		return request(this.URL + 'aj/weikan/list', {
					referrer	: this.URL,
					queryString	: {
						'__rnd'	:	key,
					},
				}).addCallback(function(res){
				/*
				 {"code":"100000","msg":"","data":[{"id":3489261203391134,"name":"\u300aThey Brow Me Away\u300b","selected":true}]}
				*/
				//alert(res.responseText);	
					var m = res.responseText.match(/"id":(\d+)/);
					if(m) {
						return m[1];
					}
					else {
						return false;
					}
		});
	},
	getForm : function(url,ps){
		var self = this;
		return request(url,{
				referrer	: ps.pageUrl,
				queryString : {
					title		: ps.item,
					referrer	: ps.pageUrl,
					editType	: 4,
					medias		: '["' + ps.itemUrl + '"]',
				},
			}).addCallback(function(res){
				var text = res.responseText;
				var m = text.match(/\$CONFIG\['servertime'\]\s+=\s+(\d+)\s*;/);
				if(!m) {
					throw new Error("Request failed, login required.");
				}
				var key = m[1];
				return self.getWid(key).addCallback(function(wid) {
					//alert('wid = ' + wid);
					if(!wid) {
						throw new Error("Get wid failed, login required maybe.");
					}
/*
medias={"http://hu.luo.bo/files/2011/10/07/f40b217a0a8bb5aafd5837f51971c57f.jpg":""}
wid=3489261203391134
title=title
apply=0
type=1
source_url=http://luo.bo/14967/
body=DESC
_jsKey=134747173478711
_t=0
*/
					return {
						_jsKey	: key,
						_t		: 0,
						type	: 1,
						title	: ps.item,
						wid		: wid,
						apply	: 0,
						medias	: '{"' + ps.itemUrl + '":""}',
						source_url : ps.pageUrl,
					};
				});
			});
	},
	
	postForm : function(fn){
		var self = this;
		var d = succeed();
		d.addCallback(fn);
		d.addCallback(function(res){
			//alert(res.responseText);
		});
		return d;
	},
	
});

