// URL

// http://zootool.com/api/add
// Authentication

// required
// Arguments

    // apikey (required)
    // url (required)
    // title (required)
    // tags (optional) comma separated string of tags
    // description (optional)
    // referer (optional) must be a valid url
    // public (optional) can be 'y' or 'n'

// Example

// http://zootool.com/api/add/?url=http://www.google.com&title=Google&apikey=###


if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : 'Zootool',
	ICON : ' http://zootool.com/favicon.ico',
	
	check : function(ps){
		return (/link|photo|quote/).test(ps.type);
	},
	getInfo : function(ps){
		return request('http://zootool.com/post/item/',{
							referrer	:	ps.pageUrl,
							queryString	:	{
								iframe	:	'true',
								url		:	ps.itemUrl,
								title	:	ps.item,
								referer	:	ps.pageUrl,
							},
		}).addCallback(function(res){
			var dom = convertToHTMLDocument(res.responseText);
			//alert(dom);
			var inputs = dom.getElementsByTagName('input');
			//alert(inputs.length);
			var r = {};//{id:'',uid:'',referer:'',type:'',subtype:'',inthezoo:'',source:'','public':'',iframe:'',action:''}
			for(var i=0;i<inputs.length;i++) {
				r['' + inputs[i].name] = inputs[i].value;	
			}
			//alert(r);
			return r;
		});
	},
	post : function(oldps){
		models.pre_post(oldps);	
		var ps = oldps;
		if(ps.file) {
			ps = models.file_to_link(oldps);
		}
	    var tag = joinText(ps.tags, ',');
        var ispublic = 'y';
        if(ps.adult || ps.private) {
            ispublic = 'n';
        }
		//URL=http://zootool.com/post/item/?iframe=true&url=http%3A%2F%2Fwww.poco.cn%2F&title=POCO.CN-%E6%88%91%E7%9A%84%E7%85%A7%E7%89%87%EF%BC%8C%E6%88%91%E7%9A%84%E7%A9%BA%E9%97%B4%EF%BC%81%20%E4%B8%AD%E5%9B%BD%E7%AC%AC%E4%B8%80%E5%9B%BE%E7%89%87%E7%A4%BE%E5%8C%BA%20%E4%B8%AA%E4%BA%BA%E7%A9%BA%E9%97%B4%20%E7%94%B5%E5%AD%90%E6%9D%82%E5%BF%97%20%E5%90%8C%E5%9F%8E%E6%B4%BB%E5%8A%A8&referer=http://www.poco.cn/
		//POSTDATA=loading=Please%2C%20wait%20a%20second&title=Baidu&tags=test&email_to=&loading=Sending%20email&id=2653683&uid=sza7&referer=http%3A%2F%2Fbaidu.com&type=page&subtype=baidu&inthezoo=n&type=page&source=lasso&public=y&iframe=&action=add&description=desc&email_body=http%3A%2F%2Fzoo.tl%2Fsza7

		return this.getInfo(ps).addCallback(function(info){
			request('http://zootool.com/post/actions/',{
				referrer		:	ps.pageUrl,
				sendContent		:	{
					loading		:	'Please wait 20 second',
					title		:	ps.item,
					tags		:	tag,
					email_to	:	'',
					loading		:	'Sending email',
					id			:	info.id,
					uid			:	info.uid,
					referer		:	ps.pageUrl,
					type		:	info.type,
					subtype		:	info.subtype,
					inthezoo	:	info.inthezoo,
					source		:	info.source,
					iframe		:	info.iframe,
					'public'	:	ispublic,
					action		:	info.action,
					description	:	ps.description || ps.item,
					email_body	:	'http://zoo.tl/' + info.uid,
				},
		});
	});
		//use api, require auth!!!
		// return request('http://zootool.com/api/add/', {
                // referrer    : ps.pageUrl,
                // queryString : {
					// apikey		:	'9d404867dd9ddc0d98209dca6fff8cd0',
					// url			:	ps.itemUrl,
					// title		:	ps.item,
					// tags		:	tag,
					// description	:	ps.description,
					// referer		:	ps.pageUrl,
					// 'public'	:	ispublic,
				// },
		// });
	},
});
