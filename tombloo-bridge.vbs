Class Bookmark
	Public item
	Public bmType
	Public itemUrl
	Public pageUrl
	Public tags
	Public description
	Public file
	Public profd
	Public body
	Public isPrivate
	Public isAdult
	Public content
				REM "item=>" + ps.item,
				REM 'type=>' + ps.type,
				REM 'itemUrl=>' + ps.itemUrl,
				REM 'pageUrl=>' + ps.pageUrl,
				REM 'tags=>' + joinText(ps.tags,","),
				REM 'description=>' + (ps.description || ""),
				REM 'file=>'+ (ps.file ? ps.file.path : ""),
				REM 'profd=>' + profd,
				REM 'body=>' + ps.body,
				REM 'private=>' + (ps.private ? '1' : '0'),
				REM 'adult=>' + (ps.adult ? '1' : '0'),
End Class

Public FSO
set FSO = CreateObject("Scripting.FileSystemObject")

Sub Say(text)
	MsgBox text,0
End Sub

Sub Alert(text)
	MsgBox text,16
End Sub

Function DateString(t)
	t = Replace(t,"\","-")
	t = Replace(t,"/","-")
	t = Replace(t,":","-")
	t = Replace(t," ","_")
	DateString = t
End Function

Function GetBookmark()
	dim ws
	dim args
	set ws = WScript
	set args = ws.Arguments
	set GetBookmark = Nothing
	If args.length < 1 then 	
		Exit Function
	End If
	dim bm 
	set bm = new Bookmark
	bm.content = args(0)
	dim profd
	profd = FSO.GetAbsolutePathName(FSO.GetParentFolderName(ws.ScriptFullName))
	bm.profd = profd
	REM Say "profd: " + profd
	set GetBookmark = bm
End Function

Function SaveBookmark(bm)
	
	dim pDir 
	pDir = bm.profd
	
	REM pDir = FSO.BuildPath(bm.profd,"tombloo")
	REM If Not FSO.FolderExists(pDir) Then
		REM FSO.createFolder(pDir)
	REM End If
	pDir = FSO.BuildPath(pDir,"bridge")
	If Not FSO.FolderExists(pDir) Then
		FSO.createFolder(pDir)
	End If
	
	REM Dim fi
	REM Dim fo
	REM dim bmFile
	REM bmFile = FSO.BuildPath(pDir,"bookmarks.txt")
	REM set fi = FSO.OpenTextFile(bm.content,1,False,-1)
	REM set fo = FSO.OpenTextFile(bmFile,8,True,-1)
	REM Dim text
	REM text = fi.ReadAll()
	REM fo.Write(text)
	REM fi.Close()
	REM fo.Close()
	REM Say text
	
	Dim dst
	dst = FSO.BuildPath(pDir,DateString(Now) + ".txt")
	REM Say bm.content
	REM Say dst
	FSO.MoveFile bm.content,dst
	
End Function

Sub Main()
	dim bm
	set bm = GetBookmark()
	if bm is Nothing then 
		Alert "Error, No Bookmark found"
		exit sub
	End If
	SaveBookmark(bm)
end Sub

Main()


