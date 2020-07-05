// globals
domainname = document.getElementById('domain-name');
thisswitch = document.getElementById('enable-disable');
cutoffslider = document.getElementById('set-cut-off');
storagename = 'reflow.1.0';
userpref = loaduserpref();

chrome.tabs.query({active:true, currentWindow:true}, tabs => {
	let currentdomain = url2domain2(tabs[0].url);
	domainname.innerHTML = currentdomain;
	// console.log(userpref);
	if (userpref.disabledon.indexOf(currentdomain) === -1) {
		thisswitch.value = 1;
	} else {
		thisswitch.value = 0;
	}
	cutoffslider.value = userpref.widthcutoff;
});

thisswitch.addEventListener('change', event => {
	let value = thisswitch.value;
	if (value === "0") {
		userpref.disabledon.push(domainname.innerHTML);
		saveuserpref();
	} else {
		userpref.disabledon.splice(userpref.disabledon.indexOf(domainname.innerHTML), 1);
		saveuserpref();
	}
	// console.log(userpref);
});
cutoffslider.addEventListener('change', event => {
	userpref.widthcutoff = parseFloat(cutoffslider.value);
	saveuserpref();
	// console.log(userpref);
});
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
function url2domain2(url) {
	return url2domain(url).replace(/https:\/\/|http:\/\//, '');
}
function saveuserpref() {
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
	userpref = loaduserpref();
}
function loaduserpref() {
	return JSON.parse(window.localStorage.getItem(storagename));
}
function widthcutoff() {
	return (loaduserpref().widthcutoff)*(window.screen.width);
}
function disableddomains() {
	return loaduserpref().disabledon;
}