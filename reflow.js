
// target mobile useragent
function gettargetua(hostbrowser) {
	if (hostbrowser === 'Edg') {
		return 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 Edg/45.3.4.4958';
	} else if (hostbrowser === 'OPR') {
		return 'Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 OPR/55.2.2719';
	} else if (hostbrowser === 'Firefox') {
		return 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0';
	} else {
		return 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36';
	}
}
// globals
host = gethost();
targetua = gettargetua(host);
tabwidth = undefined;
taburl = undefined;
reflowlist = {};

// setting user agent on request
chrome.webRequest.onBeforeSendHeaders.addListener(details => {
		let tabid = details.tabId;
		let frame = details.type;
		if (frame === 'main_frame') {
			taburl = details.url;
		} else if (tabid > -1) {
			chrome.tabs.get(tabid, tab => { 
				tabwidth = tab.width;	
				taburl = tab.url;
			});
		}
		if ((tabid > -1) && (tabwidth < userpref.widthcutoff*window.screen.width) && (userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)  && (userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1) && (userpref.disabledon.indexOf(stripprotocol(url2page(taburl))) === -1)) {
			for(let i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'User-Agent') {
					details.requestHeaders[i].value = targetua;
					break;
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
// reload on new/change of root
chrome.webNavigation.onCommitted.addListener(details => {
	let taburl = details.url;
	let tabid = details.tabId;
	if ((tabid > -1) && (details.parentFrameId === -1)) {
		chrome.tabs.get(tabid, tab => {
			taburl = tab.url;
			tabwidth = tab.width;
			let root = url2root(taburl);
			let domain = url2domain(taburl);
			if ((userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)  && (userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1) && (userpref.disabledon.indexOf(stripprotocol(url2page(taburl))) === -1)) {
				//domain upgrade
				if ((tabwidth > userpref.widthcutoff*window.screen.width) 
					&& (root.match(/\/m\.|\.m\.|\/mobile\./) !== null)) {
					let desktopurl = taburl.replace(/m\.|mobile\./, '');
					chrome.tabs.update( tabid, { url: desktopurl } );
				// cache bypass
				} else if (!reflowlist[tabid] || (reflowlist[tabid].root !== root) || ((reflowlist[tabid].status === 'ON') && (tabwidth > userpref.widthcutoff*window.screen.width)) || ((reflowlist[tabid].status === 'OFF') && (tabwidth < userpref.widthcutoff*window.screen.width))) {
					chrome.tabs.reload(tabid, { "bypassCache": true });
					if (tabwidth < userpref.widthcutoff*window.screen.width) {
						userpref.totalreflows -= 1;
						localpref.totalreflows -= 1;
					}
				}
				if (tabwidth < userpref.widthcutoff*window.screen.width) {
					userpref.totalreflows += 1;
					localpref.totalreflows += 1;
					window.localStorage.setItem(storagename, JSON.stringify(localpref));
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
			} 
		});
	}
});

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
						localpref.miniwindow.top = details.top;
						localpref.miniwindow.left = details.left;
						localpref.miniwindow.width = details.width;
						localpref.miniwindow.height = details.height;
						window.localStorage.setItem(storagename, JSON.stringify(localpref));
					}
				});
			} catch { }
		}, 5000);
	});
});
// receive user preferences
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	localpref = request;
	window.localStorage.setItem(storagename, JSON.stringify(localpref));
	userpref = getuserpref(localpref);
	console.log(`text received`, localpref, userpref);
});