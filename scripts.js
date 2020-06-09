addressbox = document.getElementById('addressbox');
mostusedlist = document.getElementById('mostused');
browser = document.getElementById('browser');
storagename = 'minibrowser.1.0';
userpref = JSON.parse(window.localStorage.getItem(storagename));

function loadthepage(url) {
	if ((url.indexOf('http') === -1) && (url.indexOf('https') === -1)) {
		url = 'http://' + url;
	}
	addressbox.value = url;
	browser.src = url;
	browser.focus();
	log(url.replace(/http:\/\/|https:\/\//i, ''));
}

if ((userpref !== null) && (userpref.recent !== '')) {
	loadthepage(userpref.recent);
}

if (userpref == null) { 
	userpref = { 
		'recent' : '',
		'log': []
	}
	saveuserpref();
} else {
	loaduserpref();
} // load user preferred conversions
function loaduserpref() {
	mostusedlist.innerHTML = '';
	for (let i = 0; (i < 10) && (i < userpref.log.length ); i++) {
		let opt = document.createElement('option');
		opt.value = userpref.log[i]['url'];
		mostusedlist.appendChild(opt);
	}
}
function saveuserpref() {
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
}
document.addEventListener('keydown', event => {
	if ((addressbox === document.activeElement)
			&& (event.key === 'Enter')) {
		loadthepage(addressbox.value);
	}
});
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
