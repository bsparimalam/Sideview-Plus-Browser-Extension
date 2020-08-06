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
	let index = stripprotocol(url).lastIndexOf('/');
	if (index === -1) {
		return url;
	} else {
		return url.slice(0, url.lastIndexOf('/'));
	}
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
	return string.replace(/https:\/\/|http:\/\//, '');
}

//////////////////////////////////////////////////////////////////////////////

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
sideurl = undefined;
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
	} else if (sideurl) {
		taburl = sideurl;
		// deteriorates with cross domain navigation ¯\_(ツ)_/¯
	}
	if (taburl && tabwidth) {
		let domain = stripprotocol(url2domain(taburl));
		let root = stripprotocol(url2root(taburl));
		let page = stripprotocol(url2page(taburl));
		if (((host==='Firefox') && (tabid === -1) && (domain.indexOf('.') !== -1) && (userpref.disabledon.indexOf(domain) === -1)  && (userpref.disabledon.indexOf(root) === -1) && (userpref.disabledon.indexOf(page) === -1)) || ((tabid > -1) && (domain.indexOf('.') !== -1) && (tabwidth < userpref.widthcutoff*screenwidth) && (userpref.disabledon.indexOf(domain) === -1)  && (userpref.disabledon.indexOf(root) === -1) && (userpref.disabledon.indexOf(page) === -1))) {
			for(let i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'User-Agent') {
					details.requestHeaders[i].value = targetua;
					break;
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
				let domain = stripprotocol(url2domain(taburl));
				let root = stripprotocol(url2root(taburl));
				let page = stripprotocol(url2page(taburl));
				if ((domain.indexOf('.') > -1) && (userpref.disabledon.indexOf(domain) === -1)  && (userpref.disabledon.indexOf(root) === -1) && (userpref.disabledon.indexOf(page) === -1)) {
					if (tabwidth < userpref.widthcutoff*screenwidth) {
						if (!reflowlist[tabid] || (reflowlist[tabid].root !== root) || (reflowlist[tabid].status === 'OFF')) {
							chrome.tabs.reload(tabid, { "bypassCache": true });
							userpref.totalreflows -= 1;
						} else {
						}
						userpref.totalreflows += 1;
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
						window.localStorage.setItem(storagename, JSON.stringify(userpref));
					} else {
						if (url2root(taburl).match(/\/m\.|\.m\.|\/mobile\./) !== null) {
							let desktopurl = taburl.replace(/m\.|mobile\./, '');
							chrome.tabs.update( tabid, { url: desktopurl } );
						} else if (!reflowlist[tabid] || (reflowlist[tabid].root !== root) || (reflowlist[tabid].status === 'ON')) {
							chrome.tabs.reload(tabid, { "bypassCache": true });
						}
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
			}
		});
	}
});

// CONTEXT MENU
if (host === 'Firefox') {
	function launchurl(urlstring) {
		browser.sidebarAction.setPanel({panel: browser.runtime.getURL(urlstring)});
	}
	let link2side = {
		"id":"link2side",
		"title": "Open Link on the Side",
		'contexts': ['link']
	};
	chrome.contextMenus.create(link2side);
	let search2side = {
		"id":"search2side",
		"title": "Search Google for '%s' in a MiniWindow",
		'contexts': ['selection']
	};
	chrome.contextMenus.create(search2side);
	let page2side = {
		"id":"page2side",
		"title": "Open this Page on the Side",
		'contexts': ['page']
	};
	chrome.contextMenus.create(page2side);
	let tab2side = {
		"id":"tab2side",
		"title": "Open this Tab on the Side",
		'contexts': ['tab']
	};
	chrome.contextMenus.create(tab2side);
	let bookmark2side = {
		"id":"bookmark2side",
		"title": "Open this Bookmark on the Side",
		'contexts': ['bookmark']
	};
	chrome.contextMenus.create(bookmark2side);

	// respond to the user request
	chrome.contextMenus.onClicked.addListener((async (click, tab) => {
		console.log(click);
		if ((click.menuItemId ==='search2side') && click.selectionText) {
			let minibrowser = {
				"state": "normal",
				"type": "popup",
				"url": 'https://google.com/search?q=' + translate4search(click.selectionText),
				"top" : userpref.miniwindow.top,
				"left" : userpref.miniwindow.left,
				"width" : userpref.miniwindow.width,
				"height" : userpref.miniwindow.height
			};
			chrome.windows.create(minibrowser);
		} else if ((click.menuItemId === 'link2side') && click.linkUrl) {
			sideurl = click.linkUrl;
			browser.sidebarAction.open();
			launchurl(sideurl);
		} else if ((click.menuItemId === 'page2side') && click.pageUrl) {
			sideurl = click.pageUrl;
			browser.sidebarAction.open();
			launchurl(sideurl);
		} else if ((click.menuItemId === 'tab2side') && tab.url) {
			sideurl = tab.url;
			browser.sidebarAction.open();
			launchurl(sideurl);
		} else if ((click.menuItemId === 'bookmark2side') && click.bookmarkId) {
			let temp = await browser.bookmarks.get(click.bookmarkId);
			sideurl = temp[0].url;
			browser.sidebarAction.open();
			launchurl(sideurl);
		}
	}));
} else {
	let linkinpopup = {
		"id":"linkinpopup",
		"title": "Open link in a miniwindow",
		'contexts': ['link']
	}
	chrome.contextMenus.create(linkinpopup);
	let searchinpopup = {
		"id":"searchinpopup",
		"title": "Search Google for '%s' in a miniwindow",
		'contexts': ['selection']
	}
	chrome.contextMenus.create(searchinpopup);
	let pageinpopup = {
		"id":"pageinpopup",
		"title": "Open this page in a miniwindow",
		'contexts': ['page']
	};
	chrome.contextMenus.create(pageinpopup);
	// define the window parameters
	let minibrowser = {
		"state": "normal",
		"focused": true
	};
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
	});
}
// receive user preferences
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request === 'reload') {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			let tab = tabs[0];
			let tabid = tab.id;
			let taburl = tab.url;
			//domain upgrade
			if ((url2root(taburl).match(/\/m\.|\.m\.|\/mobile\./) !== null) && (tabid > -1)) {
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