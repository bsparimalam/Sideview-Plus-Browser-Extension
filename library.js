//common globals
storagename = 'reflow.1.0';
localpref = getlocalpref(storagename);
userpref = getuserpref(localpref);

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
	return string.replace(/https:\/\/|http:\/\/|chrome:\/\/|edge:\/\//, '');
}
function gethost() {
	let hostua = navigator.userAgent;
	let temp = hostua.split('/');
	temp = temp[temp.length-2];
	temp = temp.split(' ')[1];
	return temp;
}
// function saveuserdata(cachename, cachedata) {
// 	window.localStorage.setItem(cachename, JSON.stringify(localdata));
// 	console.log(userdata);
// }
// function loaduserdata(cachename) {
// 	return 
// }
function getlocalpref(cachename) {
	let localdata = JSON.parse(window.localStorage.getItem(cachename));
	if (localdata === null) {
		localdata = {
			"miniwindow": {},
			"disabledon": [],
			"enabledon": [],
			"totalreflows": 0
		}
		window.localStorage.setItem(cachename, JSON.stringify(localdata));
	}
	return localdata;
}

function getuserpref(localdata) {
	let userdata = {
		"miniwindow": {
			'top': Math.round(window.screen.height*0.05),
			'left': Math.round(window.screen.width*0.55),
			'width': Math.round(window.screen.width*0.40),
			'height': Math.round(window.screen.height*0.90)
		},
		"disabledon": ['facebook.com', 'messenger.com', 'microsoft.com', 'whatsapp.com', 'devtools://devtools', "sfu.ca", 'youtube.com',  "extensions", "settings", "bookmarks", "history", "newtab" ],
		"enabledon": [],
		"widthcutoff": 0.41,
		"totalreflows": 0
	};
	let item; let index;
	if (localdata.miniwindow !== undefined) {
		userdata.miniwindow.top = localdata.miniwindow.top;
		userdata.miniwindow.left = localdata.miniwindow.left;
		userdata.miniwindow.width = localdata.miniwindow.width;
		userdata.miniwindow.height = localdata.miniwindow.height;
	} else { 
		localdata.miniwindow = {};
	}
	if (localdata.disabledon !== undefined) { 
		for (let i = 0; i < localdata.disabledon.length; i++) {
			item = localdata.enabledon[i];
			index = userdata.disabledon.indexOf(item);
			if (index === -1) {
				userdata.disabledon.push(item);
			}
		}
	} else { 
		localdata.disabledon = [];
	}
	if (localdata.enabledon !== undefined) {
		for (let i = 0; i < localdata.enabledon.length; i++) {
			item = localdata.enabledon[i];
			index = userdata.disabledon.indexOf(item);
			if (index !== -1) {
				userdata.disabledon.splice(index, 1);
			}
		}
	} else {
		localdata.enabledon = [];
	}
	if (localdata.widthcutoff !== undefined) {
		userdata.widthcutoff = localdata.widthcutoff;
	}
	if (localdata.totalreflows !== undefined) {
		userdata.totalreflows = localdata.totalreflows;
	}
	return userdata;
}