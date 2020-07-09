
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
function stripprotocol(string) {
	return string.replace(/https:\/\/|http:\/\/|chrome:\/\/|edge:\/\//, '');
}
function gethost() {
	let hostua = navigator.userAgent;
	let temp = hostua.split('/');
	temp = temp[temp.length-2];
	temp = temp.split(' ')[1];
	return temp;
}
// target mobile useragent
function gettargetua() {
	let temp = gethost();
	if (temp === 'Edg') {
		return 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 Edg/45.3.4.4958';
	} else if (temp === 'OPR') {
		return 'Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 OPR/55.2.2719';
	} else if (temp === 'Firefox') {
		return 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0';
	} else {
		return 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36';
	}
}
function widthcutoff() {
	return (userpref.widthcutoff)*(window.screen.width);
}
function saveuserpref() {
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
	chrome.runtime.sendMessage(userpref);
	console.log(userpref);
}
function loaduserpref() {
	return JSON.parse(window.localStorage.getItem(storagename));
}
function setuserpref() {
	chrome.tabs.query({active:true, currentWindow:true}, tabs => {
		let website = stripprotocol(url2root(tabs[0].url));
		let domain = stripprotocol(url2domain(tabs[0].url));
		websitename.innerText = website;
		domainname.innerText = domain;
		widthslider.value = userpref.widthcutoff;
		if (userpref.disabledon.indexOf(domain) !== -1) {
			websiteswitch.value = 0;
			domainswitch.value = 0;
		} else if (userpref.disabledon.indexOf(website) !== -1) {
			websiteswitch.value = 0;
			domainswitch.value = 1;
		} else {
			websiteswitch.value = 1;
			domainswitch.value = 1;
		}
	});
}
// receive user preferences
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	userpref = request;
	console.log(`text received`, userpref);
});

// global variables
storagename = 'reflow.1.0';
host = gethost();
targetua = gettargetua();
screenwidth =  window.screen.width;
screenheight = window.screen.height;
tabwidth = undefined;
taburl = undefined;
reflowlist = {};
userpref = JSON.parse(window.localStorage.getItem(storagename));

if (userpref === null) {
	userpref = {
		"miniwindow": {
			'top': Math.round(screenheight*0.05),
			'left': Math.round(screenwidth*0.55),
			'width': Math.round(screenwidth*0.40),
			'height': Math.round(screenheight*0.90)
		},
		"disabledon": ['facebook.com', 'messenger.com', 'microsoft.com', 'whatsapp.com', 'devtools://devtools', "sfu.ca", 'youtube.com',  "extensions", "settings", "bookmarks", "history", "newtab" ],
		"widthcutoff": 0.5,
		"totalreflows": 0
	}
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
	console.log(`userpref=${userpref}`);
} else {
	if(!userpref.totalreflows) {
		userpref.totalreflows = 0;
	}
}
console.log(`host=${host}; targetua=${targetua}; screenwidth=${screenwidth}; screenheight=${screenheight}; widthcutoff=${widthcutoff}; userpref=${loaduserpref()}`);

// setting user agent on request
chrome.webRequest.onBeforeSendHeaders.addListener(
	details => {
		let tabid = details.tabId;
		if (tabid > -1) {
			chrome.tabs.get(tabid, tab => { 
				tabwidth = tab.width;
				taburl = tab.url;
			});
			// console.log(`request header: widthtest=${(tabwidth < widthcutoff())}; domaintest=${(userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)}; websitetest=${(userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1)}`);
			if ((tabwidth < widthcutoff()) && (userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)  && (userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1)) {
				for(let i = 0; i < details.requestHeaders.length; ++i) {
					if (details.requestHeaders[i].name === 'User-Agent') {
						details.requestHeaders[i].value = targetua;
						break;
					}
				}
			}
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
chrome.webNavigation.onCommitted.addListener(details => {
	let taburl = details.url;
	let tabid = details.tabId;
	if ((tabid > -1) && (userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)  && (userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1)) {
		chrome.tabs.get(tabid, tab => {
			taburl = tab.url;
			tabwidth = tab.width;
			let root = url2root(taburl);
			let domain = url2domain(taburl);
			// console.log(`request header: widthtest=${(tabwidth < widthcutoff())}; domaintest=${(userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)}; websitetest=${(userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1)}; mobilesitetest=${(taburl.match(/\/m\.|\.m\.|\/mobile\./) !== null)}; cachetest=${(!reflowlist[tabid] || (reflowlist[tabid].root !== root) || ((reflowlist[tabid].status === 'ON') && (tabwidth > widthcutoff())) || ((reflowlist[tabid].status === 'OFF') && (tabwidth < widthcutoff())))}`);
			//domain upgrade
			if ((tabwidth > widthcutoff()) 
				&& (root.match(/\/m\.|\.m\.|\/mobile\./) !== null)) {
				let desktopurl = taburl.replace(/m\.|mobile\./, '');
				chrome.tabs.update( tabid, { url: desktopurl } );
			// cache bypass
			} else if (!reflowlist[tabid] || (reflowlist[tabid].root !== root) || ((reflowlist[tabid].status === 'ON') && (tabwidth > widthcutoff())) || ((reflowlist[tabid].status === 'OFF') && (tabwidth < widthcutoff()))) {
				chrome.tabs.reload(tabid, { "bypassCache": true });
				if (tabwidth < widthcutoff()) {
					userpref.totalreflows -= 1;
				}
			}
			if (tabwidth < widthcutoff()) {
				userpref.totalreflows += 1;
				saveuserpref();
				reflowlist[tabid] = {
					"status": 'ON',
					'domain': domain,
					'root': root
				}
				chrome.browserAction.getBadgeText({'tabId': tabid}, result => {
					if (result !== "ON") {
						chrome.browserAction.setBadgeText({
							"text": "ON",
							"tabId": tabid
						});
					}
				});
			} else {
				reflowlist[tabid] = {
					"status": 'OFF',
					'domain': domain,
					'root': root
				}
				chrome.browserAction.getBadgeText({'tabId': tabid}, result => {
					if (result !== "") {
						chrome.browserAction.setBadgeText({
							"text": "",
							"tabId": tabid
						});
					}
				});
			}
		});
	}
});

// () => {
// 	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
// 		console.log('interval', tabs);
// 		let tab = tabs[0];
// 		tabid = tab.id;
// 		if (tabid > -1) {
// 			taburl = tab.url;
// 			let domain = url2domain(taburl);
// 			if (((reflowlist[tabid].status === 'ON') && (reflowlist[tabid].domain === domain) && (tabwidth > widthcutoff())) || ((reflowlist[tabid].status === 'OFF') && (reflowlist[tabid].domain === domain) && (tabwidth < widthcutoff()))) {
// 				chrome.browserAction.getBadgeText({'tabId': tabid}, result => {
// 					if (result !== "⭮") {
// 						chrome.browserAction.setBadgeText({
// 							"text": "⭮",
// 							"tabId": tabid
// 						});
// 					}
// 				});
// 			}
// 		}
// 	});
// }

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

// respond to the user request
chrome.contextMenus.onClicked.addListener((click) => {
	minibrowser.top = userpref.miniwindow.top;
	minibrowser.left = userpref.miniwindow.left;
	minibrowser.width = userpref.miniwindow.width;
	minibrowser.height = userpref.miniwindow.height;
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
	chrome.windows.getCurrent(details => {
		setTimeout(() => {
			try {
				chrome.windows.get(details.id, details => {
					if (details) {
						userpref.miniwindow.top = details.top;
						userpref.miniwindow.left = details.left;
						userpref.miniwindow.width = details.width;
						userpref.miniwindow.height = details.height;
						saveuserpref();
					}
				});
			} catch { }
		}, 10000);
	});
});