models.register({
	name : 'FirefoxBookmark',
	ICON : 'chrome://tombloo/skin/firefox.ico',
	ANNO_DESCRIPTION : 'bookmarkProperties/description',
	
	check : function(ps){
		return (/(photo|quote|link)/).test(ps.type);
	},
	
	post : function(oldps){
		models.pre_post(oldps);
		var ps;
		if(oldps.file) {
			ps = models.file_to_link(oldps);
		}
		else {
			ps = models.convert_to_link(oldps);
		}
		var desc = ps.description;
		// if(ps.type == 'photo') {
			// if(ps.tags) {
				// ps.tags.push('imagelink');
			// }
			// else {
				// ps.tags = ['imagelink'];
			// }
			// if(!desc) {
				// desc = ps.pageUrl;
			// }
		// }
		// else if(ps.type == 'quote') {
			// if(ps.tags) {
				// ps.tags.push('quotelink');
			// }
			// else {
				// ps.tags = ['quotelink'];
			// }
			// desc =  ps.body || desc || ps.pageUrl;
		// }
		return succeed(this.addBookmark(ps.itemUrl, ps.item, ps.tags, desc));
	},
	
	addBookmark : function(uri, title, tags, description,ps){
		var bs = NavBookmarksService;
		
		var folder;
		var index = bs.DEFAULT_INDEX;
		
		// ハッシュタイプの哈方か?
		if(typeof(uri)=='object' && !(uri instanceof IURI)){
			if(uri.index!=null)
				index = uri.index;
			
			folder = uri.folder;
			title = uri.title;
			tags = uri.tags;
			description = uri.description;
			uri = uri.uri;
		}
		
		uri = createURI(uri);
		tags = tags || [];
		
		// フォルダが隆峺協の��栽は隆屁尖のブックマ�`クになる
		folder = (!folder)? 
			bs.unfiledBookmarksFolder : 
			this.createFolder(folder);
		
		// 揖じフォルダにブックマ�`クされていないか?
		if(!bs.getBookmarkIdsForURI(uri, {}).some(function(item){
			return bs.getFolderIdForItem(item) == folder;
		})){
			var folders = [folder].concat(tags.map(bind('createTag', this)));
			folders.forEach(function(folder){
				bs.insertBookmark(
					folder, 
					uri,
					index,
					title);
			});
		}
		
		this.setDescription(uri, description);
	},
	
	getBookmark : function(uri){
		uri = createURI(uri);
		var item = this.getBookmarkId(uri);
		if(item)
			return {
				title       : NavBookmarksService.getItemTitle(item),
				uri         : uri.asciiSpec,
				description : this.getDescription(item),
			};
	},
	
	isBookmarked : function(uri){
		return this.getBookmarkId(uri) != null;
		
		// 贋壓しなくてもtrueが卦ってくるようになり旋喘できない
		// return NavBookmarksService.isBookmarked(createURI(uri));
	},
	
	removeBookmark : function(uri){
		this.removeItem(this.getBookmarkId(uri));
	},
	
	removeItem : function(itemId){
		NavBookmarksService.removeItem(itemId);
	},
	
	getBookmarkId : function(uri){
		if(typeof(uri)=='number')
			return uri;
		
		uri = createURI(uri);
		return NavBookmarksService.getBookmarkIdsForURI(uri, {}).filter(function(item){
			while(item = NavBookmarksService.getFolderIdForItem(item))
				if(item == NavBookmarksService.tagsFolder)
					return false;
			
			return true;
		})[0];
	},
	
	getDescription : function(uri){
		try{
			return AnnotationService.getItemAnnotation(this.getBookmarkId(uri), this.ANNO_DESCRIPTION);
		} catch(e){
			return '';
		}
	},
	
	setDescription : function(uri, description){
		if(description == null)
			return;
		
		description = description || '';
		try{
			AnnotationService.setItemAnnotation(this.getBookmarkId(uri), this.ANNO_DESCRIPTION, description, 
				0, AnnotationService.EXPIRE_NEVER);
		} catch(e){}
	},
	
	createTag : function(name){
		return this.createFolder(name, NavBookmarksService.tagsFolder);
	},
	
	/*
	NavBookmarksServiceに嚠め贋壓するフォルダID
		placesRoot
		bookmarksMenuFolder
		tagsFolder
		toolbarFolder
		unfiledBookmarksFolder
	*/
	
	/**
	 * フォルダを恬撹する。
	 * 屡に揖兆のフォルダが揖じ��侭に贋壓する��栽は、仟たに恬撹されない。
	 *
	 * @param {String} name フォルダ兆各。
	 * @param {Number} parentId 
	 *        フォルダの弖紗枠のフォルダID。福待された��栽ブックマ�`クメニュ�`となる。
	 * @return {Number} 恬撹されたフォルダID。
	 */
	createFolder : function(name, parentId){
		parentId = parentId || NavBookmarksService.bookmarksMenuFolder;
		
		return this.getFolder(name, parentId) ||
			NavBookmarksService.createFolder(parentId, name, NavBookmarksService.DEFAULT_INDEX);
	},
	
	/**
	 * フォルダIDを函誼する。
	 * 屡に揖兆のフォルダが揖じ��侭に贋壓する��栽は、仟たに恬撹されない。
	 *
	 * @param {String} name フォルダ兆各。
	 * @param {Number} parentId 
	 *        フォルダの弖紗枠のフォルダID。福待された��栽ブックマ�`クメニュ�`となる。
	 */
	getFolder : function(name, parentId) {
		parentId = parentId || NavBookmarksService.bookmarksMenuFolder;
		
		let query = NavHistoryService.getNewQuery();
		let options = NavHistoryService.getNewQueryOptions();
		query.setFolders([parentId], 1);
		
		let root = NavHistoryService.executeQuery(query, options).root;
		try{
			root.containerOpen = true;
			for(let i=0, len=root.childCount; i<len; ++i){
				let node = root.getChild(i);
				if(node.type === node.RESULT_TYPE_FOLDER && node.title === name)
					return node.itemId;
			}
		} finally {
			root.containerOpen = false;
		}
	},
});

