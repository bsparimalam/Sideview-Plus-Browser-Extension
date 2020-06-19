let minibrowser = {
	"url": "./engine/index.html",
	"focused": true,
	"width": 400,
	"height": 700,
	"type": "popup",
	"state": "normal"
}
let dothesearch = {
	"id":"search",
	"title": "Search Google for '%s' in MiniBrowser",
	'contexts': ['selection']
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
		minibrowser.url += '?minibrowse=https://google.com/';
	}
	chrome.windows.create(minibrowser);
});