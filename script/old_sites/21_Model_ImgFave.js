if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'ImgFave',
	ICON : 'http://imgfave.com/favicon.ico',
	
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
        var privacy = '0';
		models.pre_post(ps);
        if(ps.adult || ps.private) {
            privacy = '1';
        }
		var tag = joinText(ps.tags, ',');
		/*
        POSTDATA=
		i=http%3A%2F%2Freubenmiller.typepad.com%2F.a%2F6a00d8341ca70953ef01538e18d247970b-500wi
		&t=ShareSomeCandy
		&u=http%3A%2F%2Fwww.sharesomecandy.com%2F
		&n=1
		&tags=tag1%2Ctag2
		*/
		/*
		X-Requested-With=XMLHttpRequest
		*/
        return request('http://imgfave.com/items/additem', {
            referrer    : ps.pageUrl,
			'X-Requested-With'	: 'XMLHttpRequest',
            sendContent : {
				i		:	ps.itemUrl,
				t		:	ps.item,
				u		:	ps.pageUrl,
				n		:	privacy,
				tags	:	tag,
           },
        });
	},
	
});
