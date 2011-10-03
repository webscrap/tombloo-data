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
		/*
		POSTDATA=
		http%3A%2F%2Fvi.sualize.us%2Fkeyduel%2F=
		&action=add
		&title=Title+%2F+Author
		&referenceURL=http%3A%2F%2Fpiccsy.com%2F2011%2F05%2Ftomas-gorostiaga---timo-photography%2F
		&address=http%3A%2F%2Fimages.piccsy.com%2Fcache%2Fimages%2Ftomas-gorostiaga---timo-photography-85030-530-355.jpg
		&tags=%2Ctag1%2Ctag2%2Csystem%3Aunsafe
		&fauxTags=
		&submitted=1
		&popup=1
		&nsfw=nsfw
		&public=public
		&ajax=1
		&status=0
		*/
		/*
		POSTDATA=
		http%3A%2F%2Fvi.sualize.us%2Fkeyduel%2F=
		&action=add
		&title=Piccsy+%3A%3A+Tomas+Gorostiaga+-+Timo+Photography
		&referenceURL=http%3A%2F%2Fpiccsy.com%2F2011%2F05%2Ftomas-gorostiaga---timo-photography%2F
		&address=http%3A%2F%2Fimages.piccsy.com%2Fcache%2Fimages%2F63067-fadff5-140-140.jpg
		&tags=%2Ctag1%2Ctag2%2C
		&fauxTags=
		&submitted=1
		&popup=1
		&ajax=1
		&status=2
		*/
		/*
		POSTDATA=
		title=title+%2F+Author
		&description=Description
		&tags=tag1%2Ctag2
		&address=http%3A%2F%2Fpiccsy.com%2Fimages%2Favatars%2F7019-1304346747.jpg
		&referenceURL=http%3A%2F%2Fpiccsy.com
		&status=2
		&submitted=submitted
		&referrer=http%3A%2F%2Fvi.sualize.us%2Fkeyduel%2F%3Faction%3Dadd
		*/
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
           },
        });
	},
	
});
