//URL=http://ikeepu.com/command/BmItemAdd?url=http%3A%2F%2Fqz.qq.com%2F185196590%2Fblog%3Fuin%3D185196590%26vin%3D1055186234%26blogid%3D1291615632%23http%3A%2F%2Fb61.photo.store.qq.com%2Fhttp_imgload.cgi%3F%2Frurl4_b%3Dd25515537ece984d0b0fcf432717464305d4fb93279cc4eadad3b7007772c0364748a3ac0d0222d0717505eab9af6a672dfc1eb7f2adc8304a40d9b7b380ed7ede1e98f95500049d06594134c25526ee0ef59e6d%26a%3D50%26b%3D61&title=%E5%BC%A0%E9%A6%A8%E4%BA%88%20-%20QZ.QQ.COM&tag=cn%2Cbabe%2Cpictures%2C%E5%BC%A0%E9%A6%A8%E4%BA%88&privacy=false&sync=0%2C2%2C3%2C1&category=npd&description=QQ%E7%A9%BA%E9%97%B4-%E6%88%91%E7%9A%84%E7%94%9F%E6%B4%BB%2C%E6%88%91%E7%9A%84%E6%97%B6%E5%B0%9A%EF%BC%81&body=http%3A%2F%2Fb61.photo.store.qq.com%2Fhttp_imgload.cgi%3F%2Frurl4_b%3Dd25515537ece984d0b0fcf432717464305d4fb93279cc4eadad3b7007772c0364748a3ac0d0222d0717505eab9af6a672dfc1eb7f2adc8304a40d9b7b380ed7ede1e98f95500049d06594134c25526ee0ef59e6d%26a%3D50%26b%3D61&type=1#1303392428953



if(typeof(models)=='undefined')
	this.models = models = new Repository();
    
models.register({
	name : '爱库网',
	ICON : 'http://www.ikeepu.com/favicon.ico',
	
	check : function(ps){
		return (/(photo|link)/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
		models.pre_post(ps);
	    var tag = joinText(ps.tags, ',');
        tag = joinText(tag.split(/\s*,\s*/),',');
        var privacy = 'false';
        var sync = '0,2,3,1';
        var category = '';
        if(ps.adult || ps.private) {
            privacy = 'true';
            sync = '';
        }
        if(ps.type == 'photo') {
            return request('http://ikeepu.com/command/BmItemAdd', {
                referrer    : ps.pageUrl + '#' + ps.itemUrl,
                queryString : {
                    url         : ps.pageUrl,
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
                    description : ps.description || ps.itemUrl,
                    type        : '1',
                    body        : ps.itemUrl,
               },
            });
        }
        else {
            return request('http://ikeepu.com/command/BmItemAdd', {
                referrer    : ps.pageUrl,
                queryString : {
                    url         : ps.pageUrl,
                    title       : ps.item,
                    tag         : tag,
                    privacy     : privacy,
                    sync        : sync,
                    category    : category,
                    description : ps.description || ps.pageUrl,
                    type        : '0',
               },
            });
        }
	},
	
});
