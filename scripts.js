addressbox = document.getElementById('addressbox');
mostusedlist = document.getElementById('mostused');
browser = document.getElementById('browser');
storagename = 'minibrowser.1.0';
userpref = JSON.parse(window.localStorage.getItem(storagename));

function strip(url) {
	if (url.slice(url.length-1, ) === '/') {
		url = url.slice(0, url.length-1);
	}
	return url.replace(/http:\/\/|https:\/\/|www\./i, '');
}

function loadthepage(url) {
	url = strip(url);
	addressbox.value = '';
	addressbox.placeholder = url;
	browser.src = 'http://' + url;
}

if ((userpref !== null) && (userpref.recent !== '')) {
	loadthepage(userpref.recent);
}

function loaduserpref() {
	mostusedlist.innerHTML = '';
	for (let i = 0; (i < 10) && (i < userpref.log.length ); i++) {
		let opt = document.createElement('option');
		let url = userpref.log[i]['url'];
		opt.value = url;
		mostusedlist.appendChild(opt);
	}
}

function saveuserpref() {
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
}

if (userpref == null) { 
	userpref = { 
		'recent' : '',
		'log': []
	}
} else {
	loaduserpref();
} // load user preferred conversions

function log (url) {
	userpref.recent = url;
	var urlindex = 0;
	while ((urlindex < userpref.log.length) &&
		(url != userpref.log[urlindex]['url']) ) {
		urlindex++;
	}
	if (urlindex != userpref.log.length) {
		userpref.log[urlindex].usecount += 1;
	} else {
		userpref.log.push({
			'url' : url,
			'usecount'	: 1,
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

browser.addEventListener('load', event => {
	let url;
	try {
		url = browser.location.href;
	} catch {
		url = browser.src;
	}
	log(strip(url));
});

browser.addEventListener('error', event => {
	browser.src = './error.html';
});