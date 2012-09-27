
models.register({
	name : 'Sprintpad',
	ICON : 'http://springpad.com/favicon.ico",
	SHARE_API : 'http://springpad.com/api/users/me/blocks?return=blocks',
	check : function(ps){
		return true;
	},
	request : function(url,data) {
		return request(url,data).addCallback(function(res){
			if(res.responseText && res.responseText.indexOf('action="/login"')) {		
				throw new Error(getMessage('error.notLoggedin'));
			}
		});
	},
	/*
	*/
	share : function(ps,newTab) {
		var apiurl = this.SHARE_API;
		var queryString = {
			post		: ps.itemUrl,
			url			: ps.pageUrl,
			title		: ps.item,
			description : ps.description,
			video_bool	: (ps.type == 'video' ? 'true' : 'false'),
			hl			: '',
		}
		if(!newTab) {
			return request(apiurl, {
				referrer	: ps.pageUrl || ps.itemUrl,
				queryString : queryString,
			});
		}
		else {
			var params = [];
			for(i in queryString) {
				params.push(i + '=' + queryString[i]);
			}
			var url = apiurl + '?' + joinText(params,'&');
			return addTab(url);
		}
	},
	upload : function(ps) {
		var self = this;
		return this.share(ps).addCallback(function(res) {
			var doc = convertToHTMLDocument(res.responseText);
			var form = formContents(doc);
			return form;
		});
	},
	/*
	 URL=http://springpad.com/api/users/me/blocks?return=blocks
 {
	 "block":{
		"type":"Bookmark",
		"properties":{
			"url":"http://mm.taobao.com/319426092.htm?spm=0.0.0.131.6966ca",
			"text":"TITLE",
			"image":"http://img04.taobaocdn.com/imgextra/i4/16092018560344348/T1KdS_XnRgXXXXXXXX_!!319426092-0-tstar.jpg",
			"scraper_urls":["http://mm.taobao.com/319426092.htm?spm=0.0.0.131.6966ca"],
			"secondary_images":[
				{"url":"http://img02.taobaocdn.com/imgextra/i2/16092024722300464/T1LVTRXexcXXXXXXXX_!!319426092-0-tstar.jpg","source":"image scraper","height":884,"width":750},
				{"url":"http://a.tbcdn.cn/app/matrix/face/17fixed.gif","source":"image scraper","height":null,"width":null},
				{"url":"http://img03.taobaocdn.com/tps/i3/T16mYPXXRgXXbxWZA4-85-110.png","source":"image scraper","height":null,"width":null}
			],
			"sources":[
					{"name":"mm.taobao.com","value":"http://mm.taobao.com/319426092.htm?spm=0.0.0.131.6966ca"}
					],
			"resolved_by":[
				{"date":"/Date(1348765076556)/","source":null,"from_microformat":false,"name":"scraper"}
				],
			"services":[
				"bookmark_url:http://mm.taobao.com/319426092.htm?spm=0.0.0.131.6966ca"
			],
			"image_assets":[
				{"url":"http://img04.taobaocdn.com/imgextra/i4/16092018560344348/T1KdS_XnRgXXXXXXXX_!!319426092-0-tstar.jpg","source":"image scraper","height":1205,"width":950,"/meta/sourceClient":"clipper","/meta/sourceAction":"user_chosen"},
				{"url":"http://img03.taobaocdn.com/imgextra/i3/16092016628550401/T1oR1.Xc4sXXXXXXXX_!!319426092-0-tstar.jpg","source":"image scraper","height":900,"width":600,"/meta/sourceClient":"clipper","/meta/sourceAction":"user_chosen"},
				{"url":"http://img02.taobaocdn.com/imgextra/i2/16092021993408064/T1A7YxXl0bXXXXXXXX_!!319426092-0-tstar.jpg","source":"image scraper","height":1067,"width":800,"/meta/sourceClient":"clipper","/meta/sourceAction":"user_chosen"}],
			"tags":["tag1","tag2"],
			"workbooks":["1f3939f8-a093-41c9-b655-85e10052e841"],
			"feed_comment":null,
			"/meta/sourceUrl":"http://mm.taobao.com/319426092.htm?spm=0.0.0.131.6966ca"
		},
		"name":"æ·å¥³é - å§¬åç³",
		"modified":null,"created":"2012-09-27T17:02:34.715Z"
	}
}
	 */
	post : function(oldps){
		var ps = modelExt.createPost(oldps,"weheartit");//,'tumblr-file');
		var self = this;
		if(ps.type == 'photo') {
			var block = {
				type	: 'Bookmark',
				properties	: {
					url		: ps.pageUrl,
					text	: ps.item,
					image	: ps.itemUrl,
					scraper_urls : [ps.pageUrl],
					secondary_images	: [],
					sources	:	[
							{	
								name	: "source",
								value	: ps.pageUrl,
							}
						],
					resolved_by	: [
							{
								date	: "/Date(" + (+new Date) + ")/",
								source	: null,
								from_microformat: false,
								name	: "scraper",
							}
						],
					services	: [
							"bookmark_url:" + ps.pageUrl,
						],
					"image_assets"	: [
							{
								url		:	ps.itemUrl,
								source	:	"image scraper",
								height	:	null,
								width	:	null,
								"/meta/sourceClient"	: "clipper",
								"/meta/sourceAction"	: "user_chosen",
							},
						],
					tags		: ps.tags,
					workbooks	: ["1f3939f8-a093-41c9-b655-85e10052e841"],
					feed_comment: ps.description,
					"/meta/sourceUrl"	: ps.pageUrl,
				},
				name		: ps.item,
				modified	: null,
				created		: new Date,
			};
			return request(this.SHARE_API,{
				sendContent: JSON.stringify({
						"block"	: JSON.block,
					}
				),
			}).addCallback(function(res) {return self.checkPost(res,ps);});
		}
		else if(ps.type == 'link') {
			throw new Error(ps.type + ' is not supported.');
		}
		else {
			throw new Error(ps.type + ' is not supported.');
		}
	},
	checkPost : function(res,ps) {
		return res;
		var r = res.responseText;
		var self = this;
		if(r.match(/"errCode":\s*("0"|0)\s*,/)) {
			return res;
		}
		else {
			self.share(ps,1);
			throw new Error("Post failed:\n " + r);
		}
	},
});
