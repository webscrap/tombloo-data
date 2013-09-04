
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
	/*
	source_url=/pin/create/bookmarklet/?media=http%3A%2F%2F25.media.tumblr.com%2F93fc4893a7a1a88be79ae2664dd4f90c%2Ftumblr_mslf35foEp1r68mxdo1_500.jpg&url=http%3A%2F%2Fdreamwoman-boobs.tumblr.com%2Fpost%2F60256628575%2Fbelleamavel-http-www-belleamavel-tumblr-com&title=dream-boobs%20%E2%80%94%20belleamavel%3A%20http%3A%2F%2Fwww.belleamavel.tumblr.com&is_video=false&description
data={"options":{"board_id":"370421206790206364","description":"Thanks you","link":"http://dreamwoman-boobs.tumblr.com/post/60256628575/belleamavel-http-www-belleamavel-tumblr-com","image_url":"http://25.media.tumblr.com/93fc4893a7a1a88be79ae2664dd4f90c/tumblr_mslf35foEp1r68mxdo1_500.jpg","method":"bookmarklet","is_video":"false"},"context":{"app_version":"9afae38"}}
module_path=App()>PinBookmarklet()>PinCreate()>PinForm()>Button(class_name=repinSmall pinIt, text=Pin it, disabled=false, has_icon=true, tagName=button, show_text=false, type=submit, color=primary)

	*/
	upload : function(ps) {
		var apiurl = 'http://pinterest.com/pin/create/bookmarklet/';
		return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : {
					media		: modelExt.safeUrl(ps.itemUrl),
					url			: modelExt.safeUrl(ps.pageUrl),
					title		: ps.item,
					is_video	: ps.type == 'video' ? 'true' : 'false',
					description	: ps.description,
				},
			}	
		).addCallback(function(res) {
			var r = res.responseText;
			if(r) {
				var boardid = getPref('target.pinterest');
				var token;
				var form_url;
				var m;
				if(!boardid) {
					 m = r.match(/id="id_board"[^>]+value="(\d+)"/);
					if(m) {
						boardid = m[1];
					}
					else {
						throw new Error("No BOARD found for posting");
					}
				}
				return {id:boardid};
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
	//	modelExt.assertFalse(ps,{'adult':true,'private':true});
	    var tag = joinText(ps.tags, ',');
		var tag_text = joinText(ps.tags,' #');
		if(tag_text) {
			tag_text = '[#' + tag_text + ']';
		}
		var description =  ps.item + "\n" + ps.description + "\n" + tag_text
		if(ps.type == 'photo') {
		/*
source_url=/pin/create/bookmarklet/?media=http%3A%2F%2F25.media.tumblr.com%2F93fc4893a7a1a88be79ae2664dd4f90c%2Ftumblr_mslf35foEp1r68mxdo1_500.jpg&url=http%3A%2F%2Fdreamwoman-boobs.tumblr.com%2Fpost%2F60256628575%2Fbelleamavel-http-www-belleamavel-tumblr-com&description=belleamavel%3A%0A%0Ahttp%3A%2F%2Fwww.belleamavel.tumblr.com
data={"options":{"board_id":"370421206790206364","description":"belleamavel:\n\nhttp://www.belleamavel.tumblr.com","link":"http://dreamwoman-boobs.tumblr.com/post/60256628575/belleamavel-http-www-belleamavel-tumblr-com","image_url":"http://25.media.tumblr.com/93fc4893a7a1a88be79ae2664dd4f90c/tumblr_mslf35foEp1r68mxdo1_500.jpg","method":"bookmarklet","is_video":null},"context":{"app_version":"9afae38"}}
module_path=App()>PinBookmarklet()>PinCreate()>PinForm()>Button(class_name=repinSmall pinIt, text=Pin it, disabled=false, has_icon=true, tagName=button, show_text=false, type=submit, color=primary)

*/
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
					var actionUrl1 = 'http://pinterest.com/pin/create/bookmarklet/'
					var actionUrl2 = 'http://pinterest.com/resource/PinResource/create/'
					var query = "media=" + ps.itemUrl + "&url=" + ps.pageUrl + "&description=" + ps.item
					return request(actionUrl2,{
								referrer	: actionUrl1 + "?" + query ,
								headers		: {
									'X-Requested-With' : 'XMLHttpRequest',
									'X-CSRFToken'	:	getCookieValue('pinterest.com','csrftoken'),
								//=LAuHllmSZ25EJ6DGKEkBoyrHIL3iwKkA; 'LAuHllmSZ25EJ6DGKEkBoyrHIL3iwKkA',
									'X-NEW-APP'		:	'1'
								},
								sendContent : {
									source_url	: '/pin/create/bookmarklet/?' + query,
									data		:	JSON.stringify({
														"options":{
															"board_id":data.id,
															"description":description,
															"link":ps.pageUrl,
															"image_url":ps.itemUrl,
															"method":"bookmarklet",
															"is_video":null
														},
														"context":{"app_version":"9afae38"},
													}),
									module_path		: 'App()>PinBookmarklet()>PinCreate()>PinForm()>Button(class_name=repinSmall pinIt, text=Pin it, disabled=false, has_icon=true, tagName=button, show_text=false, type=submit, color=primary)',
								},
							});
								
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
