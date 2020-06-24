addressbar = document.getElementById('addressbar');
addressbox = document.getElementById('addressbox');
mostusedlist = document.getElementById('mostused');
loading = document.getElementById('loading');
browser = document.getElementById('browser');
let isminiloading;
let ismousein;
let link;
let url;
let searchengine;
let httptype;
let standardplaceholder;

storagename = 'minibrowser.1.0';
userpref = JSON.parse(window.localStorage.getItem(storagename));
let currentua = navigator.userAgent;
let temp = currentua.split(' ');
temp = temp[temp.length-1];
temp = temp.split('/');
let host = temp[0];
let popup = document.getElementById('html');
if (host === 'OPR') {
	searchengine = 'bing';
	standardplaceholder = "Search Bing or type a URL";
} else {
	standardplaceholder = "Search Google or type a URL";
	searchengine = 'google';	
}
try {
	isextension = chrome.webRequest;
} catch {
	try {
		isextension = browser.webRequest;
	} catch {
		isextension = false;
	}
}
if (isextension) {
	httptype = 'http://';
	chromeua = 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36';
	firefoxua = 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0';
	operaua = 'Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 OPR/55.2.2719';
	edgeua = 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 EdgA/45.3.4.4958';
	chrome.webRequest.onBeforeSendHeaders.addListener(
		details => {
			for(let i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'User-Agent') {
					let currentua = details.requestHeaders[i].value;
					let temp = currentua.split(' ');
					temp = temp[temp.length-1];
					temp = temp.split('/');
					let exthost = temp[0];
					if ((exthost === 'Edg') && (isminiloading || ismousein)) {
						details.requestHeaders[i].value = edgeua;
					} else if ((exthost === 'OPR') && (isminiloading || ismousein)) {
						details.requestHeaders[i].value = operaua;
					} else if ((exthost === 'Firefox') && (isminiloading || ismousein)) {
						details.requestHeaders[i].value = firefoxua;
					} else if ((isminiloading || ismousein)) {
						details.requestHeaders[i].value = chromeua;
					}
					break;
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

	chrome.webRequest.onHeadersReceived.addListener(
		details => {
			for(let i = 0; i < details.responseHeaders.length; ++i) {
				if (((details.responseHeaders[i].name.match(/x-frame-options|x-xss-protection/gi) !== null ) || (details.responseHeaders[i].value.match(/frame-ancestors/gi) !== null)) && (isminiloading || ismousein)) {
					details.responseHeaders.splice(i, 1);
				}
			}
			for(let i = 0; i < details.responseHeaders.length; ++i) {
				if (((details.responseHeaders[i].name.match(/x-frame-options|x-xss-protection/gi) !== null ) || (details.responseHeaders[i].value.match(/frame-ancestors/gi) !== null)) && (isminiloading || ismousein)) {
					details.responseHeaders.splice(i, 1);
				}
			}
			for(let i = 0; i < details.responseHeaders.length; ++i) {
				if (((details.responseHeaders[i].name.match(/x-frame-options|x-xss-protection/gi) !== null ) || (details.responseHeaders[i].value.match(/frame-ancestors/gi) !== null)) && (isminiloading || ismousein)) {
					details.responseHeaders.splice(i, 1);
				}
			}
			return {responseHeaders: details.responseHeaders};
		},
		{
			urls: ['<all_urls>']
		},
		[
			'blocking', 'responseHeaders'
		]
	);
	if (userpref === null) { 
		userpref = { 
			'recent' : 'wikipedia.org',
			'log': [
				{	
					'name': 'Dictionary',
					'url' : 'merriam-webster.com',
					'usecount'	: 1
				},
				{	
					'name': 'Calculator',
					'url' : 'desmos.com/fourfunction',
					'usecount'	: 1
				},
				{	
					'name': 'Currency Converter',
					'url' : 'xe.com/currencyconverter',
					'usecount'	: 1
				},
				{	
					'name': 'Scientific Calculator',
					'url' : 'desmos.com/scientific',
					'usecount'	: 1
				},
				{
					'name': 'Urban Dictionary',
					'url' : 'urbandictionary.com',
					'usecount'	: 1
				},
				{
					'name': 'Internet Speed Test',
					'url' : 'speedtest.net',
					'usecount'	: 1
				},
				{	
					'name': 'Wikipedia',
					'url' : 'wikipedia.org',
					'usecount'	: 1
				},
				{
					'name': 'Emoji Search',
					'url' : 'emojifinder.com',
					'usecount'	: 1
				},
				{	
					'name': 'Unicode Search',
					'url' : 'xahlee.info/comp/unicode_index.html',
					'usecount'	: 1
				},
				{	
					'name': 'Superscript Generator',
					'url' : 'lingojam.com/SuperscriptGenerator',
					'usecount'	: 1
				},
				{	
					'name': 'Subscript Generator',
					'url' : 'lingojam.com/SubscriptGenerator',
					'usecount'	: 1
				},
				{	
					'name': 'Small Caps Generator',
					'url' : 'yaytext.com/small-caps',
					'usecount'	: 1
				},
				{	
					'name': 'Strikethrough Text Generator',
					'url' : 'yaytext.com/strike',
					'usecount'	: 1
				},
				{	
					'name': 'Font Awesome',
					'url' : 'fontawesome.com/icons?d=gallery',
					'usecount'	: 1
				},
				{	
					'name': 'Movie Reviews',
					'url' : 'imdb.com',
					'usecount'	: 1
				},
				{	
					'name': 'Lyrics Search',
					'url' : 'azlyrics.com',
					'usecount'	: 1
				},
				{	
					'name': 'Instagram',
					'url' : 'instagram.com',
					'usecount'	: 1
				},
				{	
					'name': 'Google Messages',
					'url' : 'messages.google.com',
					'usecount'	: 1
				},
				{	
					'name': 'Google Voice',
					'url' : 'voice.google.com',
					'usecount'	: 1
				},
				{	
					'name': 'Google Translate',
					'url' : 'translate.google.com',
					'usecount'	: 1
				}
			]
		}
	}
} else {
	standardplaceholder = "Type a URL";
	searchengine = false;
	httptype = 'https://';
	if (userpref === null) { 
		userpref = { 
			'recent' : 'en.m.wikipedia.org/wiki/main_page',
			'log': [
				{	
					'name': 'Dictionary',
					'url' : 'merriam-webster.com',
					'usecount'	: 1
				},
				{	
					'name': 'Calculator',
					'url' : 'bhar.app/calculator',
					'usecount'	: 1
				},
				{	
					'name': 'Currency Converter',
					'url' : 'xe.com/currencyconverter',
					'usecount'	: 1
				},
				{
					'name': 'Urban Dictionary',
					'url' : 'urbandictionary.com',
					'usecount'	: 1
				},
				{
					'name': 'Internet Speed Test',
					'url' : 'fast.com',
					'usecount'	: 1
				},
				{	
					'name': 'Wikipedia',
					'url' : 'en.m.wikipedia.org/wiki/main_page',
					'usecount'	: 1
				},
				{
					'name': 'Emoji Search',
					'url' : 'emojifinder.com',
					'usecount'	: 1
				},
				{
					'name': 'Unicode Search',
					'url' : 'www.amp-what.com/unicode/search/icon',
					'usecount'	: 1
				},
				{	
					'name': 'Superscript Generator',
					'url' : 'lingojam.com/SuperscriptGenerator',
					'usecount'	: 1
				},
				{	
					'name': 'Subscript Generator',
					'url' : 'lingojam.com/SubscriptGenerator',
					'usecount'	: 1
				},
				{	
					'name': 'Small Caps Generator',
					'url' : 'yaytext.com/small-caps',
					'usecount'	: 1
				},
				{	
					'name': 'Strikethrough Text Generator',
					'url' : 'yaytext.com/strike',
					'usecount'	: 1
				},
				{	
					'name': 'Movie Reviews',
					'url' : 'imdb.com',
					'usecount'	: 1
				},
				{	
					'name': 'Lyrics Search',
					'url' : 'azlyrics.com',
					'usecount'	: 1
				}
			]
		}
	}
}
addressbox.placeholder = standardplaceholder;
addressbox.title = standardplaceholder;

function strip(url) {
	if (url.slice(url.length-1, ) === '/') {
		url = url.slice(0, url.length-1);
	}
	url = url.replace(/http:\/\/|https:\/\//i, '');
	return  url;
}
function striptoname(url) {
	url = url.slice(0, url.indexOf('/'));
	url = url.slice(0, url.lastIndexOf('.'));
	if (url.indexOf('.') !== -1) {
		url = url.slice(url.lastIndexOf('.')+1, );
	}
	return url;
}
function loadthepage(url) {
	isminiloading = true;
	browser.style.display = 'none';
	loading.style.display = 'grid';
	url = strip(url);
	if ((url.indexOf('.') === -1) && searchengine) {
		browser.src = `${httptype}${searchengine}.com/search?q=${url}`;
		setTimeout(() => {
			addressbox.placeholder = `${searchengine}.com`;
			addressbox.value = '';
		}, 500);
	} else if (url.indexOf('.') !== -1) {
		browser.src = `${httptype}${url}`;
		setTimeout(() => {
			if (url.indexOf('/') !== -1) {
				addressbox.placeholder = url.slice(0, url.indexOf('/'));
			} else {
				addressbox.placeholder = url;
			}
			addressbox.value = '';
		}, 500);
	} else {
		// error handling
	}
	log(url);
	addressbox.blur();
	browser.focus();
}
function loaduserpref() {
	mostusedlist.innerHTML = '';
	for (let i = 0; i < userpref.log.length; i++) {
		let opt = document.createElement('option');
		let url = userpref.log[i]['url'];
		opt.value = url;
		opt.textContent = userpref.log[i]['name'];
		mostusedlist.appendChild(opt);
	}
}
function saveuserpref() {
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
}
loaduserpref();
// load user preferred conversions
function log (url) {
	userpref.recent = url;
	var urlindex = 0;
	while ((urlindex < userpref.log.length) &&
		(url != userpref.log[urlindex]['url']) ) {
		urlindex++;
	}
	if (urlindex != userpref.log.length) {
		userpref.log[urlindex].usecount += 1;
	} else if (url.indexOf('.') !== -1) {
		userpref.log.push({
			'name': striptoname(url),
			'url' : url,
			'usecount'	: 1
		});
	}
	userpref.log.sort(function(a, b) { 
		return b.usecount - a.usecount; 
	});
	saveuserpref();	loaduserpref();
}
addressbox.addEventListener('focus', event => {
	addressbar.style.gridTemplateColumns = 'var(--hidenav)';
	url = addressbox.placeholder;
	addressbox.placeholder = standardplaceholder;
});
addressbox.addEventListener('blur', event => {
	addressbar.style.gridTemplateColumns = 'var(--displaynav)';
	addressbox.placeholder = url;
});
addressbox.addEventListener('keydown', event => {
	if (event.key === 'Enter') {
		loadthepage(addressbox.value);
	}
});
addressbox.addEventListener('change', event => {
	loadthepage(addressbox.value);
});
addressbar.addEventListener('click', event => {
	let target = event.target.id;
	switch(target) {
		case 'back':
			window.history.back();
			break;
		case 'forward':
			window.history.forward();
			break;
		case 'start':
			loadthepage(userpref.recent);
			break;
	}
});
document.addEventListener('mouseover', event => {
	ismousein = true;
});
document.addEventListener('mouseout', event => {
	ismousein = false;
});
browser.addEventListener('load', event => {
	browser.style.display = 'grid';
	loading.style.display = 'none';
	isminiloading = false;
});
try {
	link = new URL(window.location.href);
	let param = new URLSearchParams(link.search);
	link = strip(param.get('minibrowse'));	
} catch {
	link = userpref.recent;
}
setTimeout(() => {
	loadthepage(`${httptype}${link}`);
}, 100);