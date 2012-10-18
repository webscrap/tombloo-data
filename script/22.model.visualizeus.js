
models.register({
	name : 'Visualizeus',
	ICON : 'http://vi.sualize.us/favicon.ico',
    SHARE_API : 'http://vi.sualize.us/',
	//tidases/?action=add&popup=1&address=http%3A%2F%2Fpenthousemagazine.com%2Fwp-content%2Fuploads%2F2010%2F01%2Fjessica-jaymes.jpg&title=Jessica Jaymes Penthouse Babe of the Day&referenceURL=http%3A%2F%2Fpenthousemagazine.com%2Fpics%2Fbotd%2Fjessica-jaymes-penthouse-babe-of-the-day%2F
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},

	share : function(ps,newTab) {
		var user = getCookieString('vi.sualize.us','VISUALIZEUS-login');
		if(user) {
			user = (new String(user.toString())).replace(/%.*$/,'');
			user = user.replace(/^.*=/,'');
		}
		else {
				throw new Error(getMessage('error.notLoggedin'));
		}
		this.SHARE_API = 'http://vi.sualize.us/' + user + '/';
		var apiurl = this.SHARE_API;
		var post_api = 'http://vi.sualize.us/post/'; //?action=add

	//URL=http://vi.sualize.us/tidases/?action=add&popup=1&address=http%3A%2F%2Fpenthousemagazine.com%2Fwp-content%2Fuploads%2F2010%2F01%2Fjessica-jaymes.jpg&title=Jessica Jaymes Penthouse Babe of the Day&referenceURL=http%3A%2F%2Fpenthousemagazine.com%2Fpics%2Fbotd%2Fjessica-jaymes-penthouse-babe-of-the-day%2F
		var queryString = {
			action		: 'add',
			popup		: 1,
			address		: escape(encodeURIComponent(ps.itemUrl)),
			referenceURL: escape(encodeURIComponent(ps.pageUrl)),
			title		: escape(encodeURIComponent(ps.item)),
		}
		var params = [];
		for(i in queryString) {
			params.push(i + '=' + queryString[i]);//escape(queryString[i]));
		}
		
		ps.referrer = apiurl + '?' + joinText(params,'&');
		return succeed({responseText:'dummy'});

		if(!newTab) {
			return request(post_api, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : queryString,
			});
		}
		else {
			return addTab(post_api + '?' + joinText(params,'&'));
		}
	},
	post : function(oldps){
		var ps = modelExt.createPost(oldps,'weheartit');
		var self = this;
		return self.share(ps).addCallback(function(res){
			if(res.responseText.indexOf('<button type="submit" name="submitted" class="add" value="submitted">Save Changes</button>')>=0) {
				throw new Error("Post exists.");
			}
	        var nsfw = false;
	        if(ps.adult) {
	            nsfw = true;
	        }
			var dir = self.SHARE_API;
			var vpublic	= nsfw ? '' : (ps.private ? '' : 'public');
			var vnsfw	= nsfw ? 'nsfw' : '';
			var status	=	nsfw ? '2'	:	'0';
		/*	
			var tag = '';
			var maxtags = 6;
			var tagset = [];
			for(var i=0;i<ps.tags.length && i<maxtags;i++) {
				tagset.push(ps.tags[i].substr(0,8));
			}
		    var tag = joinText(tagset, ',');
			if(nsfw) {
				tag = joinText([tag,'system:unsafe'],',');
			}
			else {
				tag = joinText([tag,'system:safe'],',');
			}
			tag = tag.replace(/[\s\-]+/g,'').toLowerCase();
		*/
		var tagtext = xUtils.toWeiboText(ps.tags);
/*
 title=ÐÐ¸ÑÐºÐ¸ Ð¾Ñ Vosarat`a Ð½Ð° Ð½Ð¾ÑÑ...
 referenceURL=http://pictures.crazys.info/2011/02/03/gifki-ot-vosarata-na-noch-kak-vsegda.html
 address=http://img.crazys.info/files/i/2011.2.3/1_unknown.gif
 tags=adult,gif,photolink,tits,Unsorted Bookmarks
 submitted=submitted
 status=0
 nsfw=
 public=public
 */
/*
 http%3A%2F%2Fvi.sualize.us%2Ftidases%2F=
 action=add
 title=ÐÐ¸ÑÐºÐ¸ Ð¾Ñ Vosarat`a Ð½Ð° Ð½Ð¾ÑÑ...
 referenceURL=http://pictures.crazys.info/2011/02/03/gifki-ot-vosarata-na-noch-kak-vsegda.html
 address=http://img.crazys.info/files/i/2011.2.3/1_unknown.gif
 tags=system:unsafe
 fauxTags=
 submitted=1
 popup=1
 nsfw=nsfw
 public=public
 ajax=1
 status=0

*/
	        var sendContent = {
					action			:	'add',
					title			:	ps.item,
					referenceURL	:	ps.pageUrl,
					address			:	ps.itemUrl,
					//tags			:	tag,
					fauxTags		:	'',
					submitted		:	'1',
					popup			:	'1',
					ajax			:	'1',
					'status'		:	status,
					'nsfw'			:	vnsfw,
					'public'		:	vpublic,
					description		:	ps.description + "\n" + tagtext,
	        };
			sendContent[dir] = '';

	        return request(dir + '?action=add',  {
	            referrer    : ps.referrer,
				headers		: {
					'X-Requested-With'	: 'XMLHttpRequest',
					'Content-Type'		: 'application/x-www-form-urlencoded; charset=UTF-8',
					'Pragma'			: 'no-cache',
					'Cache-Control'		: 'no-cache',
				},
				sendContent	: sendContent,
	        }).addCallback(function(res){
				var t = res.responseText;
				if(t.indexOf('/login')>=0) {
					throw new Error(getMessage('error.notLoggedin'));
				}
			});
		});
	},
	
});

    
