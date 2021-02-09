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
// setTimeout(() => {
// 	chrome.windows.getCurrent(thiswindow => {
// 		console.log(thiswindow.id);
// 	}, 1000);
// });
function openontheside(url, thiswidth) {
	var windowid;
	var windowstate;
	screenwidth = window.screen.width;
	screenheight = window.screen.height;
	chrome.windows.getCurrent(thiswindow => {
		// console.log(thiswindow);
		windowid = thiswindow.id;
		windowstate = thiswindow.state;
		if (windowstate === "maximized") {
			thiswidth = Math.max(Math.round(thiswindow.width*thiswidth), 500);
			if (host === "Firefox") { 
				var side = {
					type: "normal",
					url: url,
					left: thiswindow.left + thiswindow.width - thiswidth,
					top: thiswindow.top,
					width: thiswidth,
					height: thiswindow.height
				};
			} else {
				var side = {
					type: "normal",
					url: url,
					left: thiswindow.left + thiswindow.width - thiswidth,
					top: thiswindow.top,
					width: thiswidth,
					height: thiswindow.height,
					focused: true
				};
			}
			chrome.windows.update(windowid, {
				'state': 'normal',
				'top': thiswindow.top + Math.round(thiswindow.height*0.007),
				'left': thiswindow.left,
				'height': thiswindow.height - Math.round(thiswindow.height*0.014),
				'width': thiswindow.width - thiswidth
			});
		} else {
			thiswidth = Math.max(Math.round(screenwidth*thiswidth), 500);
			if (host === "Firefox") { 
				var side = {
					type: "normal",
					url: url,
					left: screenwidth - thiswidth,
					top: 0,
					width: thiswidth,
					height: screenheight
				};
			} else {
				var side = {
					type: "normal",
					url: url,
					left: screenwidth - thiswidth,
					top: 0,
					width: thiswidth,
					height: screenheight,
					focused: true
				};
			}
		}
		if ((findchildwindow[windowid] === undefined) && (findparentwindow[windowid] === undefined)){
			chrome.windows.create(side, thatwindow => {
				findchildwindow[windowid] = thatwindow.id;
				findparentwindow[thatwindow.id] = windowid;
				if (windowstate === "maximized") { unshrinklist[thatwindow.id] = windowid; }
			});
		} else if (findchildwindow[windowid] !== undefined) {
			chrome.windows.get(findchildwindow[windowid], thatwindow => {
				if (thatwindow === undefined) {
					chrome.windows.create(side, somewindow => {
						findchildwindow[windowid] = somewindow.id;
						findparentwindow[somewindow.id] = windowid;
						if (windowstate === "maximized") { unshrinklist[somewindow.id] = windowid; }
					});
				} else {
					chrome.tabs.create({
							windowId: findchildwindow[windowid],
							url: url
					});
				}
			});
		} else if (findparentwindow[windowid] !== undefined) {
			chrome.tabs.create({
					windowId: findchildwindow[windowid],
					url: url
			});
		}
	});
	userpref.totalreflows += 1;
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
}

function mergewindows() {
	chrome.windows.getCurrent(thiswindow => {
		if (findparentwindow[thiswindow.id] !== undefined) {
			var parentwindow = findparentwindow[thiswindow.id];
			var childwindow = thiswindow.id;
		} else if (findchildwindow[thiswindow.id] !== undefined) {
			var childwindow = findchildwindow[thiswindow.id];
			var parentwindow = thiswindow.id;
		}
		if (findchildwindow[thiswindow.id] || findparentwindow[thiswindow.id]) {
			chrome.tabs.query({windowId: childwindow}, thesetabs => {
				for (i=0; i < thesetabs.length; i++) {
					chrome.tabs.create({
						windowId: parentwindow, 
						url: thesetabs[i].url
					});
				}
			});
			chrome.windows.remove(childwindow);
		}
	});
	userpref.totalreflows += 1;
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
}

//globals
today = new Date();
thisyear = today.getFullYear();
host = gethost();
targetua = gettargetua(host);
tabwidth = undefined;
taburl = undefined;
reflowlist = {};
findchildwindow = {};
findparentwindow = {};
unshrinklist = {};
newtaburl = undefined;
screenwidth =  window.screen.width;
screenheight = window.screen.height;
sidewidth = 0.30;
sidewidth2 = 0.50;

if ((host === "Chrome") || (host === "Edg")) {
	newtaburl = "chrome://newtab";
} else {
	newtaburl = "https://google.com/"
}

// load defaults if needed
if (userpref === null) {
	userpref = {
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
		"totalreflows": 0,
		"ratedat": 0
	}
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
} else {
	if (userpref.ratedat === undefined) { userpref.ratedat = 5}
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
						if ((userpref.totalreflows > 50) && (thisyear !== userpref.ratedat)) {
							if (result !== "1") {
								chrome.browserAction.setBadgeText({
									"text": "1"
								});
								chrome.browserAction.setBadgeBackgroundColor({
									"color": "#FF0000"
								});
							}
						} else if (result !== "M") {
							chrome.browserAction.setBadgeText({
								"text": "M",
								"tabId": tabid
							});
							chrome.browserAction.setBadgeBackgroundColor({
								"color": "#101a20"
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
						if ((userpref.totalreflows > 50) && (thisyear !== userpref.ratedat)) {
							if (result !== "1") {
								chrome.browserAction.setBadgeText({
									"text": "1"
								});
								chrome.browserAction.setBadgeBackgroundColor({
									"color": "#FF0000"
								});
							}
						} else if (result !== "") {
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

//context menus
//Search in a popup
let searchinpopup = {
	"id":"searchinpopup",
	"title": 'Search Google for "%s"',
	'contexts': ['selection']
}
chrome.contextMenus.create(searchinpopup);
//Link on the side
let linkontheside = {
	"id":"linkontheside",
	"title": "Open link on the side",
	'contexts': ['link']
}
chrome.contextMenus.create(linkontheside);
//this page on the side
let pageontheside = {
	"id":"pageontheside",
	"title": "Open this page on the side",
	'contexts': ['page']
};
chrome.contextMenus.create(pageontheside);

// respond to the context menu choice
chrome.contextMenus.onClicked.addListener((click) => {
	let windowid;
	if ((click.menuItemId ==='searchinpopup') && click.selectionText) {
		screenheight = window.screen.height;
		screenwidth = window.screen.width;
		var popup = {
			type: "popup",
			top: Math.round(screenheight*0.20),
			left: Math.round(screenwidth*0.15),
			height: Math.round(screenheight*0.70),
			width: Math.round(screenwidth*0.70),
			url: 'https://google.com/search?q=' + translate4search(click.selectionText)
		};
		if (host !== "Firefox") { popup.focused = true; }
		chrome.windows.create(popup);
		userpref.totalreflows += 1;
		window.localStorage.setItem(storagename, JSON.stringify(userpref));
	} else if ((click.menuItemId === 'linkontheside') && click.linkUrl) {
		openontheside(click.linkUrl, sidewidth);
	} else if ((click.menuItemId === 'pageontheside') && click.pageUrl) {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			chrome.tabs.remove(tabs[0].id);
		});
		openontheside(click.pageUrl, sidewidth);
	}
});
//unshirnk the parent window when the child is removed
chrome.windows.onRemoved.addListener(removedid => {
	if(unshrinklist[removedid] !== undefined) {
		chrome.windows.update(unshrinklist[removedid], {
			'state': 'maximized'
		});
	}
});

// receive user preference & requests
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
	} else if (request === 'contribute') {
		userpref.ratedat = thisyear;
		window.localStorage.setItem(storagename, JSON.stringify(userpref));
		chrome.browserAction.setBadgeText({
			"text": ""
		});
		chrome.browserAction.setBadgeBackgroundColor({
			"color": "#101a20"
		});
	} else if (request === 'newtab73') {
		openontheside(newtaburl, sidewidth);
	} else if (request === 'newtab11') {
		openontheside(newtaburl, sidewidth2);
	} else if (request === 'thistab73'){
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			chrome.tabs.remove(tabs[0].id);
			openontheside(tabs[0].url, sidewidth);
		});
	} else if (request === 'thistab11') {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			chrome.tabs.remove(tabs[0].id);
			openontheside(tabs[0].url, sidewidth2);
		});
	} else if (request === 'recombine') {
		mergewindows();
	} else if (request === 'modifyshortcuts') {
		if (host === 'Firefox') {
			chrome.tabs.create({url: 'about:addons'});
		} else {
			chrome.tabs.create({url: 'chrome://extensions/shortcuts'});
		}
	} else {
		userpref = request;
		window.localStorage.setItem(storagename, JSON.stringify(userpref));
	}
});
// listen to keyboard shortcuts
chrome.commands.onCommand.addListener(command => {
	switch(command) {
		case "thistabonside":
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				chrome.tabs.remove(tabs[0].id);
				openontheside(tabs[0].url, sidewidth);
			});
			break;
		case "thistabonside11":
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				chrome.tabs.remove(tabs[0].id);
				openontheside(tabs[0].url, sidewidth2);
			});
			break;
		case "newtabonside":
			openontheside(newtaburl, sidewidth);
			break;
		case "newtabonside11":
			openontheside(newtaburl, sidewidth2);
			break;
		case "recombine":
			mergewindows();
			break;
	}
});

chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLSf_yedgTZGc4sq1n17yt1eqEHi2UbV4wmXpS6ajY06uAdXssQ/viewform");