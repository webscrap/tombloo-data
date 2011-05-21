if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'Tinkrbox',
	ICON : 'http://www.tinkrbox.com/images/favicon.ico',
	
	check : function(ps){
		return (/photo|link/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),',');

		/*
POSTDATA=	box_group=on	&box_name=BOXNAME	&category=Entertainment	&labels=label1%2Clabel2+label3	&url=http%3A%2F%2Fpiccsy.com%2Fuser%2Fview%2Fkeyduel%2F	&box_type=new
POSTDATA=	box_group=on	&box=Km8gCEMoZX84	&box_name=	&category=Others	&labels=	&url=http%3A%2F%2Fvi.sualize.us%2Fview%2F51cb543efbe2fce7bc1b4839c0f4f176%2F	&box_type=existing
		*/
		var dir = 'http://www.tinkrbox.com/bookmark';

        return request(dir,  {
            referrer    : ps.pageUrl,
            sendContent : {
				box_group		:	'on',
				box_name		:	ps.item,
				category		:	'Entertainment',
				labels			:	tag,
				url				:	ps.itemUrl,
				box_type		:	'new',
           },
        });
	},
	
});
