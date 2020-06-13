addressbox = document.getElementById('addressbox');
addressbar = document.getElementById('addressbar');
mostusedlist = document.getElementById('mostused');
browser = document.getElementById('browser');
useragent = 'Mozilla/5.0 (Linux; Android 10; SM-G970U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.93 Mobile Safari/537.36';
storagename = 'minibrowser.1.0';
userpref = JSON.parse(window.localStorage.getItem(storagename));
stdmessage = "url or search";
searchmessage = "paste the first url here";
// setting mobile useragent
try {
	Object.defineProperty(
		browser.contentWindow.navigator,
		'userAgent', 
		{ get: function() { return useragent;}}
	);
} catch {
	browser.contentWindow.navigator = Object.create(navigator, {
		userAgent: { get: function() { return useragent;} }
	});
}

if (userpref == null) { 
	userpref = { 
		'recent' : 'en.m.wikipedia.org/wiki/Main_Page',
		'log': [
			{	
				'name': 'Wikipedia',
				'url' : 'en.m.wikipedia.org/wiki/Main_Page',
				'usecount'	: 1
			},
			{	
				'name': 'Dictionary',
				'url' : 'merriam-webster.com',
				'usecount'	: 1
			},
			{	
				'name': 'Calculator',
				'url' : 'desmos.com/scientific',
				'usecount'	: 1
			},
			{
				'name': 'Internet Speed Test',
				'url' : 'fast.com',
				'usecount'	: 1
			},
			{
				'name': 'Urban Dictionary',
				'url' : 'urbandictionary.com',
				'usecount'	: 1
			},
			{	
				'name': 'Scientific Calculator',
				'url' : 'desmos.com/scientific',
				'usecount'	: 1
			},
			{
				'name': 'BMI Calculator',
				'url' : 'www-jvktpeglfs.now.sh',
				'usecount'	: 1
			},
			{
				'name': 'Emoji Typer',
				'url' : 'emojityper.com',
				'usecount'	: 1
			},
			{
				'name': 'Word Counter',
				'url' : 'wordcounter.io',
				'usecount'	: 1
			},
			{
				'name': 'TicTacToe',
				'url' : 'tmaiadev-tictactoe.netlify.app',
				'usecount'	: 1
			},
			{	
				'name': 'Emoji Search',
				'url' : 'emoji.muan.co',
				'usecount'	: 1
			},
			{	
				'name': 'Unicode Search',
				'url' : 'xahlee.info/comp/unicode_index.html',
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
	url = strip(url);
	addressbox.value = '';
	if (url.indexOf('.') === -1) {
		addressbox.placeholder = searchmessage;
		browser.src = "http://google.com/search?btnI=1&sclient=mobile-gws-wiz-hp&q=" + url;
		setTimeout(() => {
			addressbox.placeholder = stdmessage;
		}, 1500);
		// let xhr = new XMLHttpRequest();
		// xhr.onload = function () {
		// 	if ((xhr.readyState === xhr.DONE) && (xhr.status === 200)) {
		// 		console.log(xhr.reponse);
		// 		console.log(xhr.responseText);
		// 	}
		// }
		// xhr.open('GET', "https://bhar.app/calculator/index.html" + url, true);
		// xhr.send();
	} else {
		browser.src = 'http://' + url;
		addressbox.placeholder = stdmessage;
	}
	log(url);
	addressbox.blur();
	browser.focus();
}

if ((userpref !== null) && (userpref.recent !== '')) {
	loadthepage(userpref.recent);
} else {
	loadthepage('en.m.wikipedia.org/wiki/Main_Page');
}

function loaduserpref() {
	mostusedlist.innerHTML = '';
	for (let i = 0; i < userpref.log.length; i++) {
		let opt = document.createElement('option');
		let url = userpref.log[i]['url'];
		opt.value = url;
		opt.textContent = userpref.log[i]['name'];
		// opt.style.backgroundImageUrl = "http://${url}/favicon.ico";
		mostusedlist.appendChild(opt);
	}
}

function saveuserpref() {
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
}

loaduserpref();
loadthepage(userpref.recent);
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
	} else if (url.indexOf('.') === -1) {
		// userpref.log.push({
		// 	'name': 'search',
		// 	'url' : url,
		// 	'usecount'	: 1
		// });
	} else {
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

document.addEventListener('keydown', event => {
	if ((addressbox === document.activeElement)
			&& (event.key === 'Enter')) {
		loadthepage(addressbox.value);
	}
});

addressbox.addEventListener('change', event => {
	loadthepage(addressbox.value);
});
// addressbox.addEventListener('input', event => {
// 	loadthepage(addressbox.value);
// });