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
		return (/(photo|quote|link|conversation|video)/).test(ps.type);
	},
	
	post : function(oldps){
		models.pre_post(oldps);
		var ps;
		if(oldps.file) {
			ps = models.file_to_link(oldps);
		}
		else {
			ps = models.convert_to_link(oldps);
		}
	    //var tag = joinText(ps.tags, ',');
//URL=http://www.delicious.com/save?url=http%3A%2F%2Fwww.delicious.com%2Fhelp%2Fapi%23posts_add&title=Delicious.com%20-%20Discover%20Yourself!&notes=&v=6&noui=1&jump=doclose
		var actionUrl = 'https://secure.delicious.com/save';
		return request(actionUrl, {
			queryString :	{
				title : ps.item,
				url   : ps.itemUrl,
				v	  : '6',
				noui  : '1',
				jump  : 'doclose'
			},
		}).addCallback(function(res){
//			alert(res.responseText);
			var doc = convertToHTMLDocument(res.responseText);
			var elmForm = doc;
			if(!doc.getElementById('csrf_token')) 
				throw new Error(getMessage('error.notLoggedin'));
			var tags = joinText(ps.tags, ',');
			tags = tags.replace(/\s+/g,'-');
//			tags = tags.replace(/\s*,\s*/g,' ');
			//url=http%3A%2F%2Fwww.delicious.com%2Fhelp%2Fapi%23posts_add
			//title=Delicious.com+-+Discover+Yourself!
			//tags=test
			//note=comments
			//private=false
			//stack_id=15045
			//csrf_token=E2slq0tnoeZYxe3gVTqJ5k8quLMtShZCvgrujOkPNLPuzigthMtHfaTJUsiDGdcaWE28oVkgR6%2FhvABXHV0jbw%3D%3D
			return request(actionUrl, {// + $x('id("saveForm")/@action', doc), {
				'X-Requested-With' : 'XMLHttpRequest',
				redirectionLimit : 0,
				sendContent : update(formContents(elmForm), {
					url		  :  ps.itemUrl,
					title	   : ps.item,
					note       : ps.description, 
					tags        : tags,
					'private'	: ((ps.adult || ps.private )? 'true' : 'false'),
				}),
			});
		});
	},
});
