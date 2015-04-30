
models.register({
	name : 'ImgFave',
	ICON : 'http://imgfave.com/favicon.ico',
	
	check : function(ps){
		return (/photo|quote/).test(ps.type) && !ps.file;
	},
	
	post : function(oldps){
        var nudity = '0';
		var ps = modelExt.createPost(oldps,'weheartit');
		modelExt.assertFalse(ps,{'adult':true,'private':true});
        if(ps.adult) {
            nudity = '1';
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
		var cid = getPref("target.imgfave") || '';
		var ctype = cid ? 'collection' : 'undefined';
        return request('http://imgfave.com/items/additem', {
			referrer: 
				'http://imgfave.com/add?i=' + ps.itemUrl + '&u=' + ps.pageUrl,
			'X-Requested-With':
				'XMLHttpRequest',
            sendContent : {
				i		:	ps.itemUrl,
				t		:	ps.item,
				u		:	ps.pageUrl,
				n		:	nudity,
				tags	:	tag,
			   collection_id : cid,
			   collection_type : ctype,
           },
        });
	},
	
});
    
