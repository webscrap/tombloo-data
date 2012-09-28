(function() {
    var thismodel = models.Delicious;
    if(thismodel) {
		thismodel.check = function(ps){
			return true;
			return (/link|photo|text|quote/).test(ps.type);
		};
    	thismodel.ori_post = thismodel.post;
    	thismodel.post =  function(oldps){
    		models.pre_post(oldps);
    		var ps;
    		if(oldps.file) {
    			ps = models.file_to_link(oldps);
    		}
			else if(oldps.type.match(/photo|link/)) {
				ps = oldps;
			}
    		else {
    			ps = models.convert_to_link(oldps);
    		}
			if(ps.adult) {
				ps.private = 'true';
			}
			if(ps.private) {
				ps.private = 'true';
			}
			else {
				ps.private = false;//'false';
			}
			return thismodel.ori_post(ps);
			//URL=https://www.delicious.com/save?url=http%3A%2F%2Fzh.wikipedia.org%2Fwiki%2FCategory%3A%25E6%2597%25A5%25E6%259C%25ACAV%25E5%25A5%25B3%25E5%2584%25AA&title=Category%3A%E6%97%A5%E6%9C%ACAV%E5%A5%B3%E5%84%AA%20-%20%E7%BB%B4%E5%9F%BA%E7%99%BE%E7%A7%91%EF%BC%8C%E8%87%AA%E7%94%B1%E7%9A%84%E7%99%BE%E7%A7%91%E5%85%A8%E4%B9%A6&notes=&v=6&noui=1&jump=doclose
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
    			var doc = convertToHTMLDocument(res.responseText);
    			var elmForm = doc;

    			if(!doc.getElementById('autocompleteTags'))//csrf_token')) 
    				throw new Error(getMessage('error.notLoggedin'));
    			var tags = joinText(ps.tags, ',');
    			tags = tags.replace(/\s+/g,'-');
/*
url=http%3A%2F%2Fzh.wikipedia.org%2Fwiki%2FCategory%3A%25E6%2597%25A5%25E6%259C%25ACAV%25E5%25A5%25B3%25E5%2584%25AA
oldUrl=http%3A%2F%2Fzh.wikipedia.org%2Fwiki%2FCategory%3A%25E6%2597%25A5%25E6%259C%25ACAV%25E5%25A5%25B3%25E5%2584%25AA
title=Category%3A%E6%97%A5%E6%9C%ACAV%E5%A5%B3%E5%84%AA+-+%E7%BB%B4%E5%9F%BA%E7%99%BE%E7%A7%91%EF%BC%8C%E8%87%AA%E7%94%B1%E7%9A%84%E7%99%BE%E7%A7%91%E5%85%A8%E4%B9%A6
tags=tag2%2Ctag1%2Cgirl
note=DESC
stack_id=15045
no_image=false
private=true
csrf_token=2Vk6R%2B4hoHATKzTZOiGSKnBQ4OnIyiSeKL0zTyFQPzGYh6A3Q15ElzKqcUx7FSIPM3ihYMET03qATjtu%2F3UR1g%3D%3D
*/

    			request(actionUrl, { 
    				'X-Requested-With' : 'XMLHttpRequest',
    				redirectionLimit : 0,
    				sendContent : update(formContents(elmForm), {
    					url	  : ps.pageUrl,
					oldUrl	  : ps.pageUrl,
    					title     : ps.item,
    					note      : ps.itemUrl,
    					tags      : tags,
						no_image	: 'false',
    					'private'	: ((ps.adult || ps.private )? 'true' : 'false'),
    				}),
    			});
    			return request(actionUrl, { 
    				'X-Requested-With' : 'XMLHttpRequest',
    				redirectionLimit : 0,
    				sendContent : update(formContents(elmForm), {
    					url	  :  ps.itemUrl,
					oldUrl	  : ps.itemUrl,
    					title     : ps.item,
    					note      : ps.description, 
    					tags      : tags,
						no_image	: 'false',
    					'private'	: ((ps.adult || ps.private )? 'true' : 'false'),
    				}),
    			});
    		});
    	};
	/**
	 * タグ、おすすめタグ、ネットワークなどを取得する。
	 * ブックマーク済みでも取得できる。
	 *
	 * @param {String} url 関連情報を取得する対象のページURL。
	 * @return {Object}
	 */
	thismodel.getSuggestions = function(url){
		var self = this;
		var ds = {
			tags : this.getUserTags(),
			suggestions : this.getCurrentUser().addCallback(function(){
				// フォームを開いた時点でブックマークを追加し過去のデータを修正可能にするか?
				// 過去データが存在すると、お勧めタグは取得できない
				// (現時点で保存済みか否かを確認する手段がない)
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
