models.register({
	name : 'FirefoxBookmark',
	ICON : 'chrome://tombloo/skin/firefox.ico',
	ANNO_DESCRIPTION : 'bookmarkProperties/description',
	
	check : function(ps){
		return (/(photo|quote|link)/).test(ps.type) && !ps.file;
	},
	
	post : function(ps){
		var desc = ps.description;
		if(ps.type == 'photo') {
			if(ps.tags) {
				ps.tags.push('imagelink');
			}
			else {
				ps.tags = ['imagelink'];
			}
			if(!desc) {
				desc = ps.pageUrl;
			}
		}
		else if(ps.type == 'quote') {
			if(ps.tags) {
				ps.tags.push('quotelink');
			}
			else {
				ps.tags = ['quotelink'];
			}
			desc =  ps.body || desc || ps.pageUrl;
			alert(desc);
		}
		return succeed(this.addBookmark(ps.itemUrl, ps.item, ps.tags, desc));
	},
	
	addBookmark : function(uri, title, tags, description,ps){
		var bs = NavBookmarksService;
		
		var folder;
		var index = bs.DEFAULT_INDEX;
		
		// ハッシュタイプの引数か?
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
		
		// フォルダが未指定の場合は未整理のブックマークになる
		folder = (!folder)? 
			bs.unfiledBookmarksFolder : 
			this.createFolder(folder);
		
		// 同じフォルダにブックマークされていないか?
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
		
		// 存在しなくてもtrueが返ってくるようになり利用できない
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
	NavBookmarksServiceに予め存在するフォルダID
		placesRoot
		bookmarksMenuFolder
		tagsFolder
		toolbarFolder
		unfiledBookmarksFolder
	*/
	
	/**
	 * フォルダを作成する。
	 * 既に同名のフォルダが同じ場所に存在する場合は、新たに作成されない。
	 *
	 * @param {String} name フォルダ名称。
	 * @param {Number} parentId 
	 *        フォルダの追加先のフォルダID。省略された場合ブックマークメニューとなる。
	 * @return {Number} 作成されたフォルダID。
	 */
	createFolder : function(name, parentId){
		parentId = parentId || NavBookmarksService.bookmarksMenuFolder;
		
		return this.getFolder(name, parentId) ||
			NavBookmarksService.createFolder(parentId, name, NavBookmarksService.DEFAULT_INDEX);
	},
	
	/**
	 * フォルダIDを取得する。
	 * 既に同名のフォルダが同じ場所に存在する場合は、新たに作成されない。
	 *
	 * @param {String} name フォルダ名称。
	 * @param {Number} parentId 
	 *        フォルダの追加先のフォルダID。省略された場合ブックマークメニューとなる。
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

