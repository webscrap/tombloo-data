
models.register({
	name : 'Pinterest',

	ICON : 'https://www.pinterest.com/favicon.ico',
	
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
		var apiurl = 'https://www.pinterest.com/pin/create/bookmarklet/';
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
			tag_text = '[ #' + tag_text + ' ]';
		}
		var description =  ps.item + "\n" + ps.description + "\n" + tag_text
		if(ps.type == 'photo') {
				/*
source_url=/pin/create/bookmarklet/?url=http%3A%2F%2Fdetail.tmall.com%2Fitem.htm%3Fspm%3Da220o.1000855.1998099587.6.KVyMxI%26id%3D41595376187%26bi_from%3Dtm_comb%26sku_properties%3D20509%3A842198185&media=http%3A%2F%2Fimg04.taobaocdn.com%2Fimgextra%2Fi4%2F811888884%2FTB2XezwaFXXXXXCXXXXXXXXXXXX_!!811888884.jpg&description=2015%E6%98%A5%E8%A3%85%E6%96%B0%E5%93%81%E6%BB%9A%E8%BE%B9%E5%9C%86%E9%A2%86%E9%95%BF%E8%A2%96%E9%92%88%E7%BB%87%E6%89%93%E5%BA%95%E8%A3%99%E5%B0%8F%E6%80%A7%E6%84%9F%E7%B4%A7%E8%BA%AB%E5%BC%B9%E5%8A%9B%E5%8C%85%E8%87%80%E8%BF%9E%E8%A1%A3%E8%A3%99%E6%BD%AE-tmall.com%E5%A4%A9%E7%8C%AB&w=790&h=1083
data={"options":{"method":"bookmarklet","description":"2015æ¥è£æ°åæ»è¾¹åé¢é¿è¢éç»æåºè£å°æ§æç´§èº«å¼¹ååèè¿è¡£è£æ½®-tmall.comå¤©ç«","link":"https://detail.tmall.com/item.htm?spm=a220o.1000855.1998099587.6.KVyMxI&id=41595376187&bi_from=tm_comb&sku_properties=20509:842198185","image_url":"https://img04.taobaocdn.com/imgextra/i4/811888884/TB2XezwaFXXXXXCXXXXXXXXXXXX_!!811888884.jpg","board_id":"311944780378827261"},"context":{}}
module_path=App()>PinBookmarklet()>PinCreate3(resource=FakePinResource(link=https://detail.tmall.com/item.htm?spm=a220o.1000855.1998099587.6.KVyMxI&id=41595376187&bi_from=tm_comb&sku_properties=20509:842198185, image_url=https://img04.taobaocdn.com/imgextra/i4/811888884/TB2XezwaFXXXXXCXXXXXXXXXXXX_!!811888884.jpg, description=2015æ¥è£æ°åæ»è¾¹åé¢é¿è¢éç»æåºè£å°æ§æç´§èº«å¼¹ååèè¿è¡£è£æ½®-tmall.comå¤©ç«))>BoardPicker(resource=BoardPickerBoardsResource(filter=all, allow_stale=true, shortlist_length=3))>SelectList(item_module=[object Object], view_type=pinCreate3, highlight_matched_text=true, suppress_hover_events=null, selected_item_index=null, selected_section_index=null, select_first_item_after_update=true, scroll_selected_item_into_view=true)
				 * 
				 */
			return this.upload(ps).addCallback(function(data) {
				if(data) {
					var actionUrl1 = 'https://www.pinterest.com/pin/create/bookmarklet/'
					var actionUrl2 = 'https://www.pinterest.com/resource/PinResource/create/'
					var query = "media=" + ps.itemUrl + "&url=" + ps.pageUrl + "&description=" + ps.item
					return request(actionUrl2,{
								referrer	: 'https://www.pinterest.com',
//								referrer	: actionUrl1 + "?" + query ,
								headers		: {
									'X-Requested-With' : 'XMLHttpRequest',
									'X-CSRFToken'	:	getCookieValue('.pinterest.com','csrftoken'),
									'X-NEW-APP'		:	'1',
									'Accept':'application/json, text/javascript, */*; q=0.01',
									'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
									'X-Pinterest-AppState' : 'active',
									'X-APP-VERSION' : 'b7e5003',
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
														"context":{},
													}),
									module_path		: 'module_path=App()>PinBookmarklet()>PinCreate3(resource=FakePinResource(link=' + 
													  ps.pageUrl + ', image_url=' +
													  ps.itemUrl + ', description=' + 
													  ps.description + '))>BoardPicker(resource=BoardPickerBoardsResource(filter=all, allow_stale=true, shortlist_length=3))>SelectList(item_module=[object Object], view_type=pinCreate3, highlight_matched_text=true, suppress_hover_events=null, selected_item_index=null, selected_section_index=null, select_first_item_after_update=true, scroll_selected_item_into_view=true)',
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
