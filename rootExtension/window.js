
let currentua = navigator.userAgent;
let temp = currentua.split(' ');
temp = temp[temp.length-1];
temp = temp.split('/');
let host = temp[0];

let minibrowser = {
	"width": 400,
	"height": 700,
	"left": 1000,
	"top": 200,
	"type": "popup",
	"state": "normal"
}
let sidebar = {
}
let linkinpopup = {
	"id":"linkinpopup",
	"title": "Open Link in a Window",
	'contexts': ['link']
}
let linkinsidebar = {
	"id":"linkinsidebar",
	"title": "Open Link on the Side",
	'contexts': ['link']
}
let newpopup = {
	"id":"newpopup",
	"title": "Open a New Window",
	'contexts': ['page']	
}
let newsidebar = {
	"id":"newsidebar",
	"title": "Open MiniBrowser on the Side",
	'contexts': ['page']	
}
let searchinpopup = {
	"id":"searchinpopup",
	"title": "Search Google for '%s' in a Window",
	'contexts': ['selection']
}
let searchinsidebar = {
	"id":"searchinsidebar",
	"title": "Search Google for '%s' on the Side",
	'contexts': ['selection']
}
let searchengine = 'google';

if (host === 'Firefox') {

	chrome.contextMenus.create(searchinpopup);
	chrome.contextMenus.create(linkinpopup);
	chrome.contextMenus.create(newpopup);
	chrome.contextMenus.create(searchinsidebar);
	chrome.contextMenus.create(linkinsidebar);
	chrome.contextMenus.create(newsidebar);

	chrome.contextMenus.onClicked.addListener((click) => {
		minibrowser.url = "./engine/index.html";
		sidebar.panel = "./engine/index.html";
		if ((click.menuItemId ==='searchinpopup') && click.selectionText) {
			minibrowser.url += '?minibrowse=' + click.selectionText;
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId === 'linkinpopup') && click.linkUrl) {
			minibrowser.url += '?minibrowse=' + click.linkUrl;
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId === 'newpopup')) {
			minibrowser.url += `?minibrowse=https://${searchengine}.com/`;
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId ==='searchinsidebar') && click.selectionText) {
			sidebar.panel += '?minibrowse=' + click.selectionText;
			browser.sidebarAction.open();
	 		browser.sidebarAction.setPanel(sidebar);
		} else if ((click.menuItemId === 'linkinsidebar') && click.linkUrl) {
			sidebar.panel += '?minibrowse=' + click.linkUrl;
			browser.sidebarAction.open();
			browser.sidebarAction.setPanel(sidebar);
		} else if ((click.menuItemId === 'newsidebar')) {
			sidebar.panel += `?minibrowse=https://${searchengine}.com/`;
			browser.sidebarAction.open();
			browser.sidebarAction.setPanel(sidebar);
		}
	});
} else if (host === 'OPR') {

	minibrowser.focused = true;
	searchinpopup.title = "Search Bing for '%s' in a Window";
	searchinsidebar.title = "Search Bing for '%s' on the Side";
	searchengine = 'bing';

	chrome.contextMenus.create(searchinpopup);
	chrome.contextMenus.create(linkinpopup);
	chrome.contextMenus.create(newpopup);

	chrome.contextMenus.onClicked.addListener((click) => {
		minibrowser.url = "./engine/index.html";
		console.log(opr.sidebarAction);
		if ((click.menuItemId ==='searchinpopup') && click.selectionText) {
			minibrowser.url += '?minibrowse=' + click.selectionText;
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId === 'linkinpopup') && click.linkUrl) {
			minibrowser.url += '?minibrowse=' + click.linkUrl;
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId === 'newpopup')) {
			minibrowser.url += `?minibrowse=https://${searchengine}.com/`;
			chrome.windows.create(minibrowser);
		}
	});
} else {

	minibrowser.focused = true;

	chrome.contextMenus.create(searchinpopup);
	chrome.contextMenus.create(linkinpopup);
	chrome.contextMenus.create(newpopup);

	chrome.contextMenus.onClicked.addListener((click) => {
		minibrowser.url = "./engine/index.html";
		sidebar.panel = "./engine/index.html";
		if ((click.menuItemId ==='searchinpopup') && click.selectionText) {
			minibrowser.url += '?minibrowse=' + click.selectionText;
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId === 'linkinpopup') && click.linkUrl) {
			minibrowser.url += '?minibrowse=' + click.linkUrl;
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId === 'newpopup')) {
			minibrowser.url += `?minibrowse=https://${searchengine}.com/`;
			chrome.windows.create(minibrowser);
		}
	});
}
