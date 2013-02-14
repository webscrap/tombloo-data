function download(sourceURL, targetFile, useManger){
	var d = new Deferred();
	var sourceURI = createURI(sourceURL);
	
	if(!targetFile)
		targetFile = getDownloadDir();
	
	if(targetFile.exists() && targetFile.isDirectory())
		targetFile.append(validateFileName(sourceURI.fileName));
	
	var targetURI = IOService.newFileURI(targetFile);
	
	var p = WebBrowserPersist();
	if(useManger)
		var download = broad(DownloadManager.addDownload(
			DownloadManager.DOWNLOAD_TYPE_DOWNLOAD, sourceURI, targetURI,
			null, null, Math.round(Date.now() * 1000), null, p));
	
	p.progressListener = {
		onLocationChange : (useManger)? bind('onLocationChange', download) : function(){},
		onProgressChange : (useManger)? bind('onProgressChange', download) : function(){},
		onSecurityChange : (useManger)? bind('onSecurityChange', download) : function(){},
		onStatusChange   : (useManger)? bind('onStatusChange', download)   : function(){},
		onStateChange    : function(progress, req, state, status){
			useManger && download.onStateChange(progress, req, state, status);
			
			if(state & IWebProgressListener.STATE_STOP){
				broad(req);
				var res = {channel : req};
				var err;

				try {
					res.status = req.responseStatus;
					res.statusText = req.responseStatusText;
				}
				catch(e) {
					err = new Error ('Failed starting download of ' + sourceURI.asciiSpec);
					//+ " \n[" + e.message+"]");
				}
				if(err) {
					error(err);
					d.errback(err);
					return;
				}
				
				if(!res.status || res.status < 400){
					d.callback(targetFile, res);
				}else{
					error(res);
					targetFile.remove(false);
					
					res.message = getMessage('error.http.' + res.status);
					d.errback(res);
				}
			}
		},
	}
	
	p.persistFlags =
		p.PERSIST_FLAGS_FROM_CACHE |
		p.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
		p.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
	p.saveURI(sourceURI, null, null, null, null, targetURI,null);
	
	return d;
}
