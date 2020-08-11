// globals
storagename = 'reflow.1.0';
userpref = JSON.parse(window.localStorage.getItem(storagename));

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
// extract page address from url
function url2page(url) {
	let urlobject = new URL(url);
	return urlobject.hostname + urlobject.pathname;
}
// extract root address from url
function url2root(url) {
	let urlobject = new URL(url);
	return urlobject.hostname;
}
// extract domain address from url
function url2domain(url) {
	url = url2root(url);
	if (nIndexOf(url, '.', 2) === -1) {
		return url;
	} else {
		let periods = url.split('.').length - 1;
		return url.slice(0, nIndexOf(url, '/', 2) + 1) + url.slice(nIndexOf(url, '.', periods-1) + 1, );
	}
}
// functions
function gethost() {
	let hostua = navigator.userAgent;
	let temp = hostua.split('/');
	temp = temp[temp.length-2];
	temp = temp.split(' ');
	temp = temp[temp.length-1];
	if (temp === "Safari") {
		temp = hostua.split('/');
		temp = temp[temp.length-3];
		temp = temp.split(' ');
		temp = temp[temp.length-1];
		if (temp === "Chrome") {
			return "Chrome";
		}
		else {
			return "Safari";
		}
	} else {
		return temp;
	}
}
//////////////////////////////////////////////////////////////////////////////

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
// translate for search
function translate4search(string) {
	let character = [ '+', '/', '&', '|', '{', '}', '[', ']', '^', '?', ':', ' ' ];
	let replacement = [ '%2B', '%2F', '%26', '%7C', '%7B', '%7D', '%5B', '%5D', '%5E', '%3F', '%3A', '+' ];
	let stringlist;
	for (let i=0; i < character.length; i++ ) {
		stringlist = string.split(character[i]);
		string = '';
		for (let j=0; j < stringlist.length; j++ ) {
			if (j === stringlist.length - 1) {
				string += stringlist[j];
			} else {
				string += stringlist[j] + replacement[i];
			}
		}
	}
	return string;
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
			'top': Math.round(screenheight*0.10),
			'left': Math.round(screenwidth*0.55),
			'width': Math.round(screenwidth*0.30),
			'height': Math.round(screenheight*0.80)
		},
		"disabledon": [
			'apple.com',
			'adobe.com',
			'bbc.com',
			'bhar.app',
			'cloudflare.com',
			'cnet.com',
			'cnn.com',
			'creativecommons.org',
			'dailymotion.com',
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
			'reddit.com',
			'whatsapp.com',
			'youtube.com'
		],
		"widthcutoff": 0.4,
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
	if (tabid > -1 ) {
		chrome.tabs.get(tabid, tab => {
			tabwidth = tab.width;
			if (frame === 'main_frame') {
				taburl = details.url; 
			} else { 
				taburl = tab.url;
			}
		});
		if (taburl && tabwidth) {
			let domain = url2domain(taburl);
			let root = url2root(taburl);
			let page = url2page(taburl);
			if ((domain.indexOf('.') !== -1) && (tabwidth < userpref.widthcutoff*screenwidth) && (userpref.disabledon.indexOf(domain) === -1)  && (userpref.disabledon.indexOf(root) === -1) && (userpref.disabledon.indexOf(page) === -1)) {
				for(let i = 0; i < details.requestHeaders.length; ++i) {
					if (details.requestHeaders[i].name === 'User-Agent') {
						details.requestHeaders[i].value = targetua;
						break;
					}
				}
			}
		}
	}
	// console.log(details);
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
	// console.log(details);
	let tabid = details.tabId;
	if ((tabid > -1) && (details.parentFrameId === -1)) {
		chrome.tabs.get(tabid, tab => {
			taburl = tab.url;
			tabwidth = tab.width;
			if (taburl && tabwidth) {
				let domain = url2domain(taburl);
				let root = url2root(taburl);
				let page = url2page(taburl);
				if ((tabwidth < userpref.widthcutoff*screenwidth) && (domain.indexOf('.') > -1) && (userpref.disabledon.indexOf(domain) === -1)  && (userpref.disabledon.indexOf(root) === -1) && (userpref.disabledon.indexOf(page) === -1)) {
					if (!reflowlist[tabid] || !reflowlist[root] || (reflowlist[tabid] === 'OFF') || (reflowlist[root] === 'OFF')) {
						chrome.tabs.reload(tabid, { "bypassCache": true });
						userpref.totalreflows -= 1;
					}
					reflowlist[root] = 'ON';
					reflowlist[tabid] = 'ON';
					userpref.totalreflows += 1;
					window.localStorage.setItem(storagename, JSON.stringify(userpref));
					chrome.browserAction.getBadgeText({'tabId': tabid}, result => {
						if (result !== "ON") {
							chrome.browserAction.setBadgeText({
								"text": "ON",
								"tabId": tabid
							});
						}
					});
				} else {
					if (((new URL(taburl)).protocol + url2root(taburl)).match(/\/m\.|\.m\.|\/mobile\./) !== null) {
						let desktopurl = taburl.replace(/m\.|mobile\./, '');
						chrome.tabs.update( tabid, { url: desktopurl } );
					} else if ((reflowlist[tabid] && (reflowlist[tabid] === 'ON')) || (reflowlist[root] && (reflowlist[root] === 'ON'))) {
						chrome.tabs.reload(tabid, { "bypassCache": true });
					}
					reflowlist[tabid] = 'OFF';
					reflowlist[root] = 'OFF';
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

let linkinpopup = {
	"id":"linkinpopup",
	"title": chrome.i18n.getMessage('openlink'),
	'contexts': ['link']
}
chrome.contextMenus.create(linkinpopup);
let searchinpopup = {
	"id":"searchinpopup",
	"title": chrome.i18n.getMessage('search'),
	'contexts': ['selection']
}
chrome.contextMenus.create(searchinpopup);
let pageinpopup = {
	"id":"pageinpopup",
	"title": chrome.i18n.getMessage('openpage'),
	'contexts': ['page']
};
chrome.contextMenus.create(pageinpopup);
// define the window parameters
let minibrowser = {
	"state": "normal"
};
if (host !== "Firefox") {
	minibrowser.focused = true;
}
// respond to the user request
chrome.contextMenus.onClicked.addListener((click) => {
	minibrowser.top = userpref.miniwindow.top;
	minibrowser.left = userpref.miniwindow.left;
	minibrowser.width = userpref.miniwindow.width;
	minibrowser.height = userpref.miniwindow.height;
	if ((click.menuItemId ==='searchinpopup') && click.selectionText) {
		minibrowser.type = 'popup';
		minibrowser.url = 'https://google.com/search?q=' + translate4search(click.selectionText);
		chrome.windows.create(minibrowser);
	} else if ((click.menuItemId === 'linkinpopup') && click.linkUrl) {
		minibrowser.type = 'popup';
		minibrowser.url = click.linkUrl;
		chrome.windows.create(minibrowser);
	} else if ((click.menuItemId === 'pageinpopup') && click.pageUrl) {
		minibrowser.type = 'popup';
		minibrowser.url = click.pageUrl;
		chrome.windows.create(minibrowser);
	}
	if (host !== "Firefox") {
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
				} catch {}
			}, 5000);
		});
	}
});
// receive user preferences
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request === 'reload') {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			let tab = tabs[0];
			let tabid = tab.id;
			taburl = tab.url;
			//domain upgrade
			if (((new URL(taburl)).protocol + url2root(taburl).match(/\/m\.|\.m\.|\/mobile\./) !== null) && (tabid > -1)) {
				let desktopurl = taburl.replace(/m\.|mobile\./, '');
				chrome.tabs.update( tabid, { url: desktopurl } );
			// cache bypass
			} else if (tabid > -1) {
				chrome.tabs.reload(tabid, { "bypassCache": true });
			}
		});
	} else {
		userpref = request;
		window.localStorage.setItem(storagename, JSON.stringify(userpref));
	}
});

chrome.runtime.setUninstallURL(`https://bhar.app/feedback/reflow.html?utm_source=${host}`);