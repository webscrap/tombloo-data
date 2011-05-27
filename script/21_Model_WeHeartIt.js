models.register({
	name : 'WeHeartIt',
	ICON : 'http://weheartit.com/favicon.ico',
	URL  : 'http://weheartit.com/',
	
	check : function(ps){
		return ps.type == 'photo' && !ps.file;
	},
	
	post : function(ps){
		models.pre_post(ps);
		if(ps.adult) {
			return fail(new Error('Adult content ignored.\n'));
		}
		if(ps.private) {
			return fail(new Error('Private content ignored.\n'));
		}
		if(!this.getAuthCookie())
			return fail(new Error(getMessage('error.notLoggedin')));
		
		// return request(this.URL + 'add.php', {
			// redirectionLimit : 0,
			// referrer : ps.pageUrl,
			// queryString : {
				// via   : ps.pageUrl,
				// title : ps.item,
				// img   : ps.itemUrl,
			// },
        //});
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
	
	favor : function(ps){
		return this.iHeartIt(ps.favorite.id);
	},
	
	iHeartIt : function(id){
		if(!this.getAuthCookie())
			return fail(new Error(getMessage('error.notLoggedin')));
		
//weheartit.com/create_entry/?media=http%3A%2F%2Fhiphotos.baidu.com%2Fqq1355597294%2Fpic%2Fitem%2F734a34d95fd6b8d9a1ec9cc6.jpg&encoding=GB2312&title=%B0%D9%B6%C8%CD%BC%C6%AC%CB%D1%CB%F7_%BB%F0&via=http%3A%2F%2Fimage.baidu.com%2Fi%3Ftn%3Dbaiduimage%26ct%3D201326592%26cl%3D2%26lm%3D-1%26fr%3D%26fmq%3D%26pv%3D%26ic%3D0%26z%3D%26se%3D1%26showtab%3D0%26fb%3D0%26width%3D%26height%3D%26face%3D0%26istype%3D2%26word%3D%25BB%25F0%26s%3D0&tags=test


		return request(this.URL + 'inc_heartedby.php', {
			redirectionLimit : 0,
			referrer : this.URL,
			queryString : {
				do    : 'heart',
				entry : id,
			},
		});
	},
	
	getAuthCookie : function(){
        //return 1;
		// クッキーの動作が不安定なため2つをチェックし真偽値を返す
		return getCookieString('weheartit.com', 'auth') && getCookieString('weheartit.com', 'auth');
	},
});