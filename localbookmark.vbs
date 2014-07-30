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

Public INPUTFORMAT
Public OUTPUTFORMAT
INPUTFORMAT = -1
OUTPUTFORMAT = -1
Public FSO
set FSO = CreateObject("Scripting.FileSystemObject")

Sub Say(text)
	MsgBox text,0
End Sub

Sub Alert(text)
	MsgBox text,16
End Sub

Function DateString(t)
	dim y
	dim m
	y = Year(t)
	m = Month(t)
	if(m<10) then
		DateString = CSTR(y) + "0" + CSTR(m)
	else
		DateString = CSTR(y) + CSTR(m)
	end if
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
	pDir = FSO.BuildPath(pDir,"data")
	If Not FSO.FolderExists(pDir) Then
		FSO.createFolder(pDir)
	End If
	
	Dim DATESTR
	DATESTR = DateString(Now)
	
	Dim dst
	dst = FSO.BuildPath(pDir,DATESTR + ".js")
	dim fi
	dim fo
	IF NOT FSO.FileExists(dst) Then
		set fo = FSO.OpenTextFile(dst,8,True,OUTPUTFORMAT)
		fo.WriteLine("")
		dim fo2
		set fo2 = FSO.OpenTextFile(FSO.BuildPath(pDir, "data.js"),8,True,0)
		fo2.WriteLine "DATA.push('" + DATESTR + "');"
		fo2.Close()
	else
		set fo = FSO.OpenTextFile(dst,8,True,OUTPUTFORMAT)
	end if	
	set fi = FSO.OpenTextFile(bm.content,1,False,INPUTFORMAT)
	fo.Write(fi.ReadAll())
	fi.Close()
	fo.Close()
	
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


