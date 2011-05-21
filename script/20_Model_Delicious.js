models.register({
	name : 'Delicious',
	ICON : 'http://www.delicious.com/favicon.ico',
	
	/**
	 * ユーザーの利用しているタグ一覧を取得する。
	 *
	 * @param {String} user 対象ユーザー名。未指定の場合、ログインしているユーザー名が使われる。
	 * @return {Array}
	 */
	getUserTags : function(user){
		// 同期でエラーが起きないようにする
		return succeed().addCallback(function(){
			return request('http://feeds.delicious.com/feeds/json/tags/' + (user || Delicious.getCurrentUser()));
		}).addCallback(function(res){
			var tags = evalInSandbox(res.responseText, 'http://feeds.delicious.com/');
			
			// タグが無いか?(取得失敗時も発生)
			if(!tags || isEmpty(tags))
				return [];
			
			return reduce(function(memo, tag){
				memo.push({
					name      : tag[0],
					frequency : tag[1],
				});
				return memo;
			}, tags, []);
		});
	},
	
	/**
	 * タグ、おすすめタグ、ネットワークなどを取得する。
	 * ブックマーク済みでも取得することができる。
	 *
	 * @param {String} url 関連情報を取得する対象のページURL。
	 * @return {Object}
	 */
	getSuggestions : function(url){
		var self = this;
		var ds = {
			tags : this.getUserTags(),
			suggestions : succeed().addCallback(function(){
				// ログインをチェックする
				self.getCurrentUser();
				
				// ブックマークレット用画面の削除リンクを使い既ブックマークを判定する
				return request('http://www.delicious.com/save', {
					queryString : {
						noui : 1,
						url  : url,
					},
				});
			}).addCallback(function(res){
				var doc = convertToHTMLDocument(res.responseText);
				return {
					editPage : 'http://www.delicious.com/save?url=' + url,
					form : {
						item        : doc.getElementById('saveTitle').value,
						description : doc.getElementById('saveNotes').value,
						tags        : doc.getElementById('saveTags').value.split(' '),
						private     : doc.getElementById('savePrivate').checked,
					},
					
					duplicated : !!doc.getElementById('savedon'),
					recommended : $x('id("recommendedField")//span[contains(@class, "m")]/text()', doc, true), 
				}
			})
		};
		
		return new DeferredHash(ds).addCallback(function(ress){
			// エラーチェック
			for each(var [success, res] in ress)
				if(!success)
					throw res;
			
			var res = ress.suggestions[1];
			res.tags = ress.tags[1];
			return res;
		});
	},
	
	getCurrentUser : function(){
		// FIXME: 判定不完全、_userが取得できて、かつ、ログアウトしている状態がありうる
		if(decodeURIComponent(getCookieString('www.delicious.com', '_user')).match(/user=(.*?) /))
			return RegExp.$1;
		
		throw new Error(getMessage('error.notLoggedin'));
	},
	
	check : function(ps){
		return (/(photo|quote|link|conversation|video)/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
		models.pre_post(ps);
		models.convert_to_link(ps);
	    //var tag = joinText(ps.tags, ',');
		return request('http://www.delicious.com/post/', {
			queryString :	{
				title : ps.item,
				url   : ps.itemUrl,
			},
		}).addCallback(function(res){
			var doc = convertToHTMLDocument(res.responseText);
			var elmForm = doc.getElementById('saveForm');
			if(!elmForm)
				throw new Error(getMessage('error.notLoggedin'));
			
			return request('http://www.delicious.com' + $x('id("saveForm")/@action', doc), {
				redirectionLimit : 0,
				sendContent : update(formContents(elmForm), {
					description : ps.item,
					jump        : 'no',
					notes       : ps.description, //joinText([ps.body, ps.description], ' ', true),
					tags        : joinText(ps.tags, ' '),
					share       : ps.private? 'no' : '',
				}),
			});
		});
	},
});