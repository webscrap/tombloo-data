if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'Piccsy',
	ICON : 'http://piccsy.com/favicon.ico',
	
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
	    var tag = new String(encodeURI(joinText(ps.tags, ',')));
		tag = tag.substr(0,94).replace(/%/,'');
		var nsfw = false;
		models.pre_post(ps);
        if(ps.adult || ps.private) {
            nsfw = true;
        }	
		/*
image_link=http%3A%2F%2Fcdnimg.visualizeus.com%2Fthumbs%2F51%2Fcb%2F51cb543efbe2fce7bc1b4839c0f4f176_m.jpg
pop_tag_photography=on
pop_tag_nsfw=on
title=Title
description=Description
src_url=http%3A%2F%2Fvi.sualize.us%2F
new_tags=tag1%2Ctag2
publish=1
bookmark=1
radio_privacy=2
submit=Create+new+post

		*/
		var dir = 'http://piccsy.com/post/create/new/';
		var vpublic	= nsfw ? '2' : '1';
		var vnsfw	= nsfw ? 'on' : 'off';
		var postcontent = {
				title			:	(new String(encodeURI(ps.item))).substr(0,94),
				description		:	ps.description,
				src_url			:	ps.pageUrl,
				image_link		:	ps.itemUrl,
				new_tags			:	tag,
				submit			:	'Create+new+post',
				pop_tag_photography	:	'on',
				'publish'			:	'1',
				bookmark			:	'1',
				radio_privacy		:	vpublic,
        };
		if(nsfw) {
			postcontent.pop_tag_nsfw = 'on';
		}
        return request(dir ,  {
            referrer    : ps.pageUrl,
			sendContent : postcontent,
        });
	},
	
});
