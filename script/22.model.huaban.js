
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
