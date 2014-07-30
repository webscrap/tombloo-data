var BOOKMARKS = [];
var DATA = [];
var NEWEST = -1;
var OLDDEST = -1;
var CURIDX = -1;
function createEntry(bm,id) {
	var idx = '' + (id+1);
	var elm = document.createElement('li');
	elm.setAttribute('class','bm_entry');
	elm.setAttribute('id','bm_entry_' + id);
	elm.innerHTML = 
			'<span><a title="' + bm.url +'" href="' + bm.url + '" id="bm_href_' + id + '">' + bm.title + '</a></span>' +
				(bm.time ? ' - <span class="bm_time">' + (new Date(bm.time)).toLocaleDateString() + '</span><BR />' : '<BR />') +
					((bm.desc || bm.tags) ? '<span id="bm_info_' + id + '">[' +
					(bm.tags ? '<span class="bm_tag">' + bm.tags.join('</span><span class="bm_tag">, ') + '</span>' : '') +
					(bm.desc ? ' - ' + bm.desc : '') + ']</span>' : '')   +
			'<BR />';
	return elm;
}

function load_page(page) {
	CURIDX = page;
	BOOKMARKS = [];
	var filename = "data/" + DATA[page] + ".js";
	var sc = document.createElement('script');
	sc.setAttribute('src',filename);
	document.body.appendChild(sc);
	var pagetip = document.getElementById('bm_curpage');
	pagetip.innerHTML = "[" + DATA[page] + "]";
	load_bookmark();
}

function load_newer() {
	var page = CURIDX  + 1;
	if(page > NEWEST) {
		alert("没有更新的数据了");
		return;
	}
	load_page(page);
}

function load_oldder() {
	var page = CURIDX -1;
	if(page < OLDDEST) {
		alert("已经加载了最早的数据");
		return;
	}
	load_page(page);
}

function load_bookmark(){

	var content = document.getElementById("bm_content");
	
	var hd = document.getElementById('bm_from');
	if(hd) {
		content.removeChild(hd);
	}
	hd = document.createElement('blockquote');
	hd.setAttribute('class','bm_from');
	hd.setAttribute('id','bm_from');
	hd.innerHTML = 'Data source: ' + DATA[CURIDX]; 
	
	var table = document.getElementById('bm_table');
	if(table) {
		content.removeChild(table);
	}
	window.setTimeout(function(){
		table = document.createElement('ol');
		table.setAttribute('class','bm_table');
		table.setAttribute('id','bm_table');
		for(var i=BOOKMARKS.length-1;i>=0;i--) {
			table.appendChild(createEntry(BOOKMARKS[i],i));
		}					
		content.appendChild(hd);
		content.appendChild(table);
	},500);
}
function init() {
	
	NEWEST = DATA.length - 1;
	OLDDEST = 0;
	CURIDX = NEWEST;
	
	load_page(CURIDX);
	
	
}

window.addEventListener('load',init);