
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
