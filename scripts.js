addressbar = document.getElementById('addressbar');
start = document.getElementById('start');
addressbox = document.getElementById('addressbox');
mostusedlist = document.getElementById('mostused');
loading = document.getElementById('loading');
browser = document.getElementById('browser');

storagename = 'minibrowser.1.0';
displaystart = '10% 90%';
hidestart = '0% 100%';
userpref = JSON.parse(window.localStorage.getItem(storagename));
stdmessage = "url or search";
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
				let host = temp[0];
				if (host === 'Edg') {
					details.requestHeaders[i].value = edgeua;
				} else if (host === 'OPR') {
					details.requestHeaders[i].value = operaua;
				} else if (host === 'Firefox') {
					details.requestHeaders[i].value = firefoxua;
				} else {
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
			if (details.responseHeaders[i].name === 'x-frame-options') {
				details.responseHeaders.splice(i, 1);
				break;
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
				'url' : 'fast.com',
				'usecount'	: 1
			},
			{	
				'name': 'Wikipedia',
				'url' : 'wikipedia.org',
				'usecount'	: 1
			},
			{
				'name': 'BMI Calculator',
				'url' : 'www-jvktpeglfs.now.sh',
				'usecount'	: 1
			},
			{
				'name': 'Emoji Search',
				'url' : 'emojityper.com',
				'usecount'	: 1
			},
			{
				'name': 'Word Counter',
				'url' : 'wordcounter.io',
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
function strip(url) {
	if (url.slice(url.length-1, ) === '/') {
		url = url.slice(0, url.length-1);
	}
	url = url.replace(/http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\./i, '');
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
	loading.style.display = 'grid';
	browser.style.display = 'none';
	url = strip(url);
	addressbox.value = '';
	if (url.indexOf('.') === -1) {
		browser.src = "http://google.com/search?q=" + url;
	} else {
		browser.src = 'http://' + url;
		addressbox.placeholder = stdmessage;
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
	console.log(userpref);
	saveuserpref();	loaduserpref();
}
addressbox.addEventListener('focus', event => {
	addressbar.style.gridTemplateColumns = hidestart;
});
addressbox.addEventListener('blur', event => {
	addressbar.style.gridTemplateColumns = displaystart;
});
addressbox.addEventListener('keydown', event => {
	console.log(event.key);
	if (event.key === 'Enter') {
		loadthepage(addressbox.value);
	}
});
addressbox.addEventListener('change', event => {
	loadthepage(addressbox.value);
});
start.addEventListener('click', event => {
	loadthepage(userpref.recent);
});
browser.addEventListener('load', event => {
	loading.style.display = 'none';
	browser.style.display = 'grid';
});
setTimeout(()=>{
	loadthepage('http://' + userpref.recent);
	setTimeout(() => { addressbox.focus(); }, 1000);
}, 100);
