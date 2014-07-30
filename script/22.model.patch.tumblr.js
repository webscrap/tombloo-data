
/*						
	1
	URL=https://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.baidu.com%2F&t=%E7%99%BE%E5%BA%A6%E4%B8%80%E4%B8%8B%EF%BC%8C%E4%BD%A0%E5%B0%B1%E7%9F%A5%E9%81%93&s=
*/

/*
	2
	
	URL=https://www.tumblr.com/share
	
	s=
	t=????o|?????????????°±??￥é??
	u=http://www.baidu.com/
	v=3
	source=bookmarklet
	form_key=yfJOcyCIr1R8fPapTu5RAFNvUjY
	secure_form_key=!331405521617|ejIWVfrThpW5OZAcChxKGNCd9s
	channel_id=tidapost
	send_to_twitter=0
	send_to_facebook=0
	post%5Bstate%5D=0
	post%5Bdate%5D=now
	post%5Bslug%5D=
	post%5Btags%5D=
	post%5Btype%5D=photo
	post%5Bthree%5D=http://www.baidu.com/
	post%5Btwo%5D= (via <a href="http://www.baidu.com/">????o|?????????????°±??￥é??</a>)
	external_urls%5B0%5D=http://www.baidu.com/img/bdlogo.gif
	post%5Bsource_url%5D=http://www.baidu.com/
	is_rich_text%5Btwo%5D=0


s=
t=????o|?????????????°±??￥é??
u=http://www.baidu.com/
v=3
source=bookmarklet
form_key=yfJOcyCIr1R8fPapTu5RAFNvUjY
secure_form_key=!331405522360|0UuBwlpOZdkEMKnP989YJdU5ZhY
channel_id=tidapost
send_to_twitter=0
send_to_facebook=0
post%5Bstate%5D=0
post%5Bdate%5D=now
post%5Bslug%5D=
post%5Btags%5D=tag1,tag2
tag3
post%5Btype%5D=photo
post%5Bthree%5D=http://www.baidu.com/
post%5Btwo%5D= (via <a href="http://www.baidu.com/">????o|?????????????°±??￥é??</a>)
external_urls%5B0%5D=http://www.baidu.com/img/bdlogo.gif
post%5Bsource_url%5D=http://www.baidu.com/
is_rich_text%5Btwo%5D=0

channel_id=tidapost
s=
t=????o|?????????????°±??￥é??
u=http://www.baidu.com/
v=3
source=bookmarklet
form_key=yfJOcyCIr1R8fPapTu5RAFNvUjY
secure_form_key=!331405523316|cvoawGLsaC8YjnVuyEOHxXHfxXw
send_to_twitter=0
send_to_facebook=0
post%5Bstate%5D=0
post%5Bdate%5D=now
post%5Bslug%5D=
post%5Btags%5D=abc,def,g,photolink
post%5Btype%5D=photo
post%5Bone%5D=
is_rich_text%5Btwo%5D=0
post%5Bthree%5D=http://www.baidu.com/
external_urls%5B0%5D=
post%5Btwo%5D=<a href="http://www.baidu.com/">????o|?????????????°±??￥é??</a>
is_rich_text%5Bthree%5D=0
post%5Bsource_url%5D=http://www.baidu.com/
photo_src=http://www.baidu.com/img/baidu_sylogo1.gif



*/

models.Tumblr.share3 = function(ps) {
	var self = this;
	return request(
		'https://www.tumblr.com/share',{
			referrer: ps.pageUrl,
			queryString:	{
				v:	3,
				u:	ps.pageUrl,
				t:	ps.item,
			},
		}
	).addCallback(function(res) {
		var doc = convertToHTMLDocument(res.responseText);
		var form = formContents(doc);
		form['post[type]'] = ps.type;
		delete form.preview_post;
		//form.redirect_to = Tumblr.TUMBLR_URL + 'dashboard';
		
		if(form.reblog_post_id)
			self.trimReblogInfo(form);
		
		// Tumblrから他サービスへポストするため画像URLを取得しておく
		if(form['post[type]'] == 'photo'){
			if(ps.itemUrl) {
				form['external_urls[0]'] = ps.itemUrl;
			}
			form.image = $x(
				'//*[contains(@class, "media_post_external_url")]' +
				'//img[contains(@src, "media.tumblr.com/") or contains(@src, "data.tumblr.com/")]/@src', doc);
		}
		//log(JSON.stringify(form));
		return form;
	});	
};

models.Tumblr.post = function(oldps){
	var self = this;
	var ps = modelExt.createPost(oldps,'tumblr+video');
	var endpoint = 'https://www.tumblr.com/share';
	ps.private = null;
	return self.postForm(function(){
		return self.share3(ps).addCallback(function(form){
			var frm = self[ps.type.capitalize()].convertToForm(ps);
			frm['post[source_url]'] = ps.pageUrl;
			frm['channel_id'] = 'tidapost';	
			ps.private = null;
			update(form, frm);
			self.appendTags(form, ps);
			return request(endpoint, {
				referrer	: endpoint,
				sendContent : form,
			});
		});
	});
};

models.Tumblr.postForm = function(fn){
		var self = this;
		var d = succeed();
		d.addCallback(fn);
		d.addCallback(function(res){
			var url = res.channel.URI.asciiSpec;
			//log(url);
			switch(true){
			case /share_confirmation/.test(url):
				return;
			
			case /login/.test(url):
				throw new Error(getMessage('error.notLoggedin'));
			
			default:
				// このチェックをするためリダイレクトを追う必要がある
				// You've used 100% of your daily photo uploads. You can upload more tomorrow.
				if(res.responseText.match('photo upload limit'))
					throw new Error("You've exceeded your daily post limit.");
				
				var doc = convertToHTMLDocument(res.responseText);
				throw new Error(convertToPlainText(doc.getElementsByClassName('errors')[0]));
			}
		});
		return d;
};

//var TumblrQueue = update({},models.Tumblr);
models.register(update(update({},models.Tumblr),
	{
		name : 'TumblrQueue',
		ICON : 'http://www.tumblr.com/favicon.ico',
		post : function(oldps) {
			var self = this;
			var ps = modelExt.createPost(oldps,'tumblr+video');
			var endpoint = 'https://www.tumblr.com/share';
			ps.private = null;
			return self.postForm(function(){
				return self.share3(ps).addCallback(function(form){
					var frm = self[ps.type.capitalize()].convertToForm(ps);
					frm['post[source_url]'] = ps.pageUrl;
					frm['channel_id'] = 'tidapost';	
					ps.private = null;
					update(form, frm);
					self.appendTags(form, ps);
					form['post[state]'] = 2; //Queue
					return request(endpoint, {
						referrer	: endpoint,
						sendContent : form,
					});
				});
			});
		},
	}
));



