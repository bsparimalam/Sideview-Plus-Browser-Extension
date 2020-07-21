// functions
function gethost() {
	let hostua = navigator.userAgent;
	let temp = hostua.split('/');
	temp = temp[temp.length-2];
	temp = temp.split(' ')[1];
	return temp;
}

// target mobile useragent
function gettargetua(hostid) {
	if (hostid === 'Edg') {
		return 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 Edg/45.3.4.4958';
	} else if (hostid === 'OPR') {
		return 'Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 OPR/55.2.2719';
	} else if (hostid === 'Firefox') {
		return 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0';
	} else {
		return 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36';
	}
}

//globals
host = gethost();
targetua = gettargetua(host);
tabwidth = undefined;
taburl = undefined;
reflowlist = {};
screenwidth =  window.screen.width;
screenheight = window.screen.height;

// load defaults if needed
if (userpref === null) {
	userpref = {
		"miniwindow": {
			'top': Math.round(screenheight*0.05),
			'left': Math.round(screenwidth*0.55),
			'width': Math.round(screenwidth*0.40),
			'height': Math.round(screenheight*0.90)
		},
		"disabledon": [
			'bookmarks',
			'downloads',
			'extensions',
			'history',
			'newtab',
			'settings',
			'apple.com',
			'adobe.com',
			'bbc.com',
			'cloudflare.com',
			'cnet.com',
			'cnn.com',
			'creativecommons.org',
			'dailymotion.com',
			'devtools://devtools',
			'europa.eu',
			'facebook.com',
			'abcnews.go.com',
			'chrome.google.com/webstore/category',
			'developers.google.com',
			'docs.google.com',
			'www.google.com/maps',
			'photos.google.com',
			'sites.google.com',
			'istockphoto.com',
			'medium.com',
			'messenger.com',
			'microsoft.com',
			'mozilla.org',
			'nytimes.com',
			'paypal.com',
			'sfu.ca',
			'whatsapp.com',
			'youtube.com'
		],
		"widthcutoff": 0.5,
		"totalreflows": 0
	}
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
} else {
	if (userpref.totalreflows === undefined) { userpref.totalreflows = 0 }
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
}

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
		if ((tabid > -1) && (tabwidth < userpref.widthcutoff*screenwidth) && (userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)  && (userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1) && (userpref.disabledon.indexOf(stripprotocol(url2page(taburl))) === -1)) {
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

chrome.webNavigation.onCommitted.addListener(details => {
	console.log(reflowlist);
	let taburl = details.url;
	let tabid = details.tabId;
	if ((tabid > -1) && (details.parentFrameId === -1)) {
		chrome.tabs.get(tabid, tab => {
			console.log(tab);
			taburl = tab.url;
			tabwidth = tab.width;
			let root = url2root(taburl);
			let domain = url2domain(taburl);
			if ((userpref.disabledon.indexOf(stripprotocol(url2domain(taburl))) === -1)  && (userpref.disabledon.indexOf(stripprotocol(url2root(taburl))) === -1) && (userpref.disabledon.indexOf(stripprotocol(url2page(taburl))) === -1)) {
				//domain upgrade
				if ((tabwidth > userpref.widthcutoff*screenwidth) 
					&& (root.match(/\/m\.|\.m\.|\/mobile\./) !== null)) {
					let desktopurl = taburl.replace(/m\.|mobile\./, '');
					chrome.tabs.update( tabid, { url: desktopurl } );
				// cache bypass
				} else if (!reflowlist[tabid] || (reflowlist[tabid].root !== root) || ((reflowlist[tabid].status === 'ON') && (tabwidth > userpref.widthcutoff*screenwidth)) || ((reflowlist[tabid].status === 'OFF') && (tabwidth < userpref.widthcutoff*screenwidth))) {
					chrome.tabs.reload(tabid, { "bypassCache": true });
					if (tabwidth < userpref.widthcutoff*screenwidth) {
						userpref.totalreflows -= 1;
					}
				}
				if (tabwidth < userpref.widthcutoff*screenwidth) {
					userpref.totalreflows += 1;
					window.localStorage.setItem(storagename, JSON.stringify(userpref));
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
	"type": "popup",
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
		minibrowser.type = "normal";
		minibrowser.url = 'chrome://newtab';
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
						window.localStorage.setItem(storagename, JSON.stringify(userpref));
					}
				});
			} catch { }
		}, 5000);
	});
});

// receive user preferences
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	userpref = request;
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
	console.log(`text received`, userpref);
});