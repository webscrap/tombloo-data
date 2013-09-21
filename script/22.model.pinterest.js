
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
				if(data) {
					var actionUrl1 = 'http://pinterest.com/pin/create/bookmarklet/'
					var actionUrl2 = 'http://pinterest.com/resource/PinResource/create/'
					var query = "media=" + ps.itemUrl + "&url=" + ps.pageUrl + "&description=" + ps.item
					return request(actionUrl2,{
								referrer	: actionUrl1 + "?" + query ,
								headers		: {
									'X-Requested-With' : 'XMLHttpRequest',
									'X-CSRFToken'	:	getCookieValue('.pinterest.com','csrftoken'),
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
