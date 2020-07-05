
windowtop = 0.05;
windowleft = 0.55;
windowwidth = 0.4;
windowheight = 0.9;
storagename = 'reflow.1.0';

// global variables
host = gethost();
targetua = gettargetua();
screenwidth =  window.screen.width;
screenheight = window.screen.height;
tabwidth = undefined;
taburl = undefined;
tablist = {};
// console.log(`host=${host}; targetua=${targetua}; screenwidth=${screenwidth}; screenheight=${screenheight}; widthcutoff=${widthcutoff}; userpref=${loaduserpref()}`);

chrome.webNavigation.onCommitted.addListener(details => {
	if (disableddomains().indexOf(url2domain2(details.url)) === -1) {
		let tabid = details.tabId;
		chrome.tabs.get(tabid, tab => {
			let root = url2root(tab.url);
			// console.log(`tabid=${tabid}; root=${root}; tablist[tabid]=${tablist[tabid]}`);
			if (domainupgrade(tabid)) {
			
			} else if (!tablist[tabid]) {
				chrome.tabs.reload(tabid, { "bypassCache": true });
				tablist[tabid] = root;
			}
		});
	}
	// console.log("userpreferences", loaduserpref());
});

// setting user agent on request
chrome.webRequest.onBeforeSendHeaders.addListener(
	details => {
		let tabid = details.tabId;
		if (tabid > -1) {
			chrome.tabs.get(tabid, tab => { 
				tabwidth = tab.width;
				taburl = tab.url;
			});
			if ((tabwidth < widthcutoff()) && (disableddomains().indexOf(url2domain2(taburl)) === -1)) {
				for(let i = 0; i < details.requestHeaders.length; ++i) {
					if (details.requestHeaders[i].name === 'User-Agent') {
						details.requestHeaders[i].value = targetua;
						break;
					}
				}
			}
			// console.log('request useragent: ', tabid, tabwidth, details);
		}
		return {requestHeaders: details.requestHeaders};
	},
	{
		urls: ["<all_urls>"]
	},
	[
		'blocking', 'requestHeaders'
	]
);
// CONTEXT MENU
// define the options 
let linkinpopup = {
	"id":"linkinpopup",
	"title": "Open link in a miniwindow",
	'contexts': ['link']
}
let newpopup = {
	"id":"newpopup",
	"title": "Open a new miniwindow",
	'contexts': ['page']	
}
let searchinpopup = {
	"id":"searchinpopup",
	"title": "Search Google for '%s' in a miniwindow",
	'contexts': ['selection']
}
// generate options
chrome.contextMenus.create(searchinpopup);
chrome.contextMenus.create(linkinpopup);
chrome.contextMenus.create(newpopup);
// define the window parameters
let minibrowser = {
	"type": "normal",
	"state": "normal"
};
if (host === 'Firefox') {

} else {
	minibrowser.focused = true;
}
minibrowser.top = Math.round(screenheight*windowtop);
minibrowser.left = Math.round(screenwidth*windowleft);
minibrowser.width = Math.round(screenwidth*windowwidth);
minibrowser.height = Math.round(screenheight*windowheight);
// respond to the user request
chrome.contextMenus.onClicked.addListener((click) => {
	if ((click.menuItemId ==='searchinpopup') && click.selectionText) {
		minibrowser.url = 'https://google.com/search?q=' + click.selectionText;
		chrome.windows.create(minibrowser);
	} else if ((click.menuItemId === 'linkinpopup') && click.linkUrl) {
		minibrowser.url = click.linkUrl;
		chrome.windows.create(minibrowser);
	} else if ((click.menuItemId === 'newpopup')) {
		minibrowser.url = 'https://google.com';
		chrome.windows.create(minibrowser);
	}
});
// get nth index of a string in a string
function nIndexOf(string, of, n) {
	let index = -1;
	for (let i=0; i < n; i++) {
		index = string.indexOf(of, index+1);
		if (index === -1) {
			break;
		}
	}
	return index;
}
// extract root address from url
function url2root(url) {
	let index = nIndexOf(url, '/', 3);
	let root;
	if (index === -1) { 
		return url;
	} else { 
		return url.slice(0, nIndexOf(url, '/', 3));
	}
}
function url2domain(url) {
	url = url2root(url);
	if (nIndexOf(url, '.', 2) === -1) {
		return url;
	} else {
		let periods = url.split('.').length - 1;
		return url.slice(0, nIndexOf(url, '/', 2) + 1) + url.slice(nIndexOf(url, '.', periods-1) + 1, );
	}
}
function url2domain2(url) {
	return url2domain(url).replace(/https:\/\/|http:\/\//, '');
}
function gethost() {
	let hostua = navigator.userAgent;
	let temp = hostua.split('/');
	host = temp[temp.length-2];
	return host.split(' ')[1];
}
// target mobile useragent
function gettargetua() {
	if (host === 'Edg') {
		return 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 Edg/45.3.4.4958';
	} else if (host === 'OPR') {
		return 'Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 OPR/55.2.2719';
	} else if (host === 'Firefox') {
		return 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0';
	} else {
		return 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36';
	}
}
function domainupgrade(tabid) {
	if (tabid > -1) {
		chrome.tabs.get(tabid, tab => {
			let url = tab.url;
			if ((tab.width > widthcutoff()) 
				&& (url.match(/\/m\.|\.m\.|\/mobile\./) !== null)) {
				let desktopurl = url.replace(/m\.|mobile\./, '');
				chrome.tabs.update( tabid, { url: desktopurl } );
				// console.log('domainupgrade', tabid, url, desktopurl);
				return true;
			} else {
				return false;
			}
		});
	} else {
		return false;
	}
}
function loaduserpref() {
	return JSON.parse(window.localStorage.getItem(storagename));
}
if (loaduserpref() === null) {
	window.localStorage.setItem(storagename, JSON.stringify({
		"disabledon": ['facebook.com', 'messenger.com', 'whatsapp.com'],
		"widthcutoff": 0.5
	}));
}
function widthcutoff() {
	return (loaduserpref().widthcutoff)*(window.screen.width);
}
function disableddomains() {
	return loaduserpref().disabledon;
}