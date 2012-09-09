if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'Visualizeus',
	ICON : 'http://vi.sualize.us/favicon.ico',
	
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
	    var tag = joinText(ps.tags, ',');
        var nsfw = false;
		models.pre_post(ps);
        if(ps.adult || ps.private) {
            nsfw = true;
        }
		var user = getCookieString('vi.sualize.us','VISUALIZEUS-login');
		if(user) {
			user = (new String(user.toString())).replace(/%.*$/,'');
			user = user.replace(/^.*=/,'');
		}
		var dir = 'http://vi.sualize.us/' + user + '/'; //?action=add
		var vpublic	= nsfw ? ''	: 'public';
		var vnsfw	= nsfw ? 'nsfw' : '';
		var status	=	nsfw ? '2'	:	'0';
        return request(dir + '?action=add',  {
            referrer    : ps.pageUrl,
			'X-Requested-With'	: 'XMLHttpRequest',
            sendContent : {
				referrer		:	dir + '?action=add',
				//action			:	'add',
				title			:	ps.item,
				//description		:	ps.description,
				referenceURL	:	ps.pageUrl,
				address			:	ps.itemUrl,
				tags			:	tag,
				//fauxTags		:	'',
				submitted		:	'submitted',
				status			:	status,
				'nsfw'			:	vnsfw,
				'public'		:	vpublic,
           },
        });
	},
	
});
