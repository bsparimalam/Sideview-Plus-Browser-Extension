let minibrowser;
let dothesearch;
let searchengine;
let currentua = navigator.userAgent;
let temp = currentua.split(' ');
temp = temp[temp.length-1];
temp = temp.split('/');
let host = temp[0];
let popup = document.getElementById('html');
if (host === 'Firefox') {
	minibrowser = {
		"url": "./engine/index.html",
		"width": 400,
		"height": 700,
		"type": "popup",
		"state": "normal"
	}
	dothesearch = {
		"id":"search",
		"title": "Search Google for '%s' in MiniBrowser",
		'contexts': ['selection']
	}
	searchengine = 'google';
} else if (host === 'OPR') {
	minibrowser = {
		"url": "./engine/index.html",
		"focused": true,
		"width": 400,
		"height": 700,
		"type": "popup",
		"state": "normal"
	}
	dothesearch = {
		"id":"search",
		"title": "Search Bing for '%s' in MiniBrowser",
		'contexts': ['selection']
	}
	searchengine = 'bing';
} else {
	minibrowser = {
		"url": "./engine/index.html",
		"focused": true,
		"width": 400,
		"height": 700,
		"type": "popup",
		"state": "normal"
	}
	dothesearch = {
		"id":"search",
		"title": "Search Google for '%s' in MiniBrowser",
		'contexts': ['selection']
	}
	searchengine = 'google';
}
let openthelink = {
	"id":"link",
	"title": "Open link in MiniBrowser",
	'contexts': ['link']
}
let openawindow = {
	"id":"window",
	"title": "Open a new MiniBrowser",
	'contexts': ['page']	
}
chrome.contextMenus.create(dothesearch);
chrome.contextMenus.create(openthelink);
chrome.contextMenus.create(openawindow);

chrome.contextMenus.onClicked.addListener( (click) => {
	minibrowser.url = "./engine/index.html";
	if ((click.menuItemId ==='search') && click.selectionText) {
		minibrowser.url += '?minibrowse=' + click.selectionText;
	} else if ((click.menuItemId === 'link') && click.linkUrl) {
		minibrowser.url += '?minibrowse=' + click.linkUrl;
	} else if ((click.menuItemId === 'window')) {
		minibrowser.url += `?minibrowse=https://${searchengine}.com/`;
	}
	chrome.windows.create(minibrowser);
});