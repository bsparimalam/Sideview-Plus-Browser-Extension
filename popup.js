
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
// target mobile useragent
function gettargetua() {
	let temp = gethost();
	if (temp === 'Edg') {
		return 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 Edg/45.3.4.4958';
	} else if (temp === 'OPR') {
		return 'Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 OPR/55.2.2719';
	} else if (temp === 'Firefox') {
		return 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0';
	} else {
		return 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36';
	}
}
function widthcutoff() {
	return (userpref.widthcutoff)*(window.screen.width);
}
function saveuserpref() {
	window.localStorage.setItem(storagename, JSON.stringify(userpref));
	chrome.runtime.sendMessage(userpref);
	console.log(userpref);
}
function loaduserpref() {
	return JSON.parse(window.localStorage.getItem(storagename));
}
function setuserpref() {
	chrome.tabs.query({active:true, currentWindow:true}, tabs => {
		console.log(tabs[0].url);
		console.log(tabs[0]);
		let page = stripprotocol(url2page(tabs[0].url));
		let website = stripprotocol(url2root(tabs[0].url));
		let domain = stripprotocol(url2domain(tabs[0].url));
		pagename.title = page;
		websitename.title = website;
		websitename.innerText = website.slice(0, 24);
		domainname.title = domain;
		domainname.innerText = domain.slice(0, 24);
		widthslider.value = userpref.widthcutoff;
		console.log((page === website), (website === domain));
		if (page === website) {
			pageswitch.disabled = true;
			pagename.style.color = 'var(--disabled)';
		}
		if (website ===  domain) {
			websiteswitch.disabled = true;
			websitename.innerText = 'subdomain';
			websitename.style.color = 'var(--disabled)';
		}
		if (userpref.disabledon.indexOf(domain) !== -1) {
			pageswitch.value = 0;
			websiteswitch.value = 0;
			domainswitch.value = 0;
		} else if (userpref.disabledon.indexOf(website) !== -1) {
			pageswitch.value = 0;
			websiteswitch.value = 0;
			domainswitch.value = 1;
		} else if (userpref.disabledon.indexOf(page) !== -1) {
			pageswitch.value = 0;
			websiteswitch.value = 1;
			domainswitch.value = 1;		
		} else {
			pageswitch.value = 1;
			websiteswitch.value = 1;
			domainswitch.value = 1;	
		}
		bugreport.href = `mailto:support@bhar.app?subject=Reflow - bug report - ${website}&body=Hi, I found an issue with the extension. Issue description: `;
		usage.innerText = Math.floor(userpref.totalreflows) + ' pages reflowed';
		console.log(userpref);
	});
}
// receive user preferences
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	userpref = request;
	console.log(`text received`, userpref);
	setuserpref();
});

// globals
storagename = 'reflow.1.0';
host = gethost();
userpref = loaduserpref();

// not duplicate
pagename = document.getElementById('page');
websitename = document.getElementById('website');
domainname =  document.getElementById('domain');
pageswitch = document.getElementById('page-switch');
websiteswitch = document.getElementById('website-switch');
domainswitch = document.getElementById('domain-switch');
widthslider = document.getElementById('width-slider');
schematic = document.getElementById('schematic');
reloadbutton = document.getElementById('reload');
usage =  document.getElementById('usage');
bugreport = document.getElementById('bugreport');
setuserpref();

document.addEventListener('change', event => {
	switch(event.target.id) {
		case 'width-slider':
			userpref.widthcutoff = parseFloat(event.target.value);
			break;
		case 'page-switch':
			if (event.target.value === '0') {
				userpref.disabledon.push(pagename.title);
			} else {
				while (userpref.disabledon.indexOf(pagename.title) !== -1) {
					userpref.disabledon.splice(userpref.disabledon.indexOf(pagename.title), 1);
				}
				while (userpref.disabledon.indexOf(websitename.title) !== -1) {
					userpref.disabledon.splice(userpref.disabledon.indexOf(websitename.title), 1);
				}
				while (userpref.disabledon.indexOf(domainname.title) !== -1) {
					userpref.disabledon.splice(userpref.disabledon.indexOf(domainname.title), 1);
				}
			}
			break;
		case 'website-switch':
			if (event.target.value === '0') {
				userpref.disabledon.push(websitename.title);
			} else {
				while (userpref.disabledon.indexOf(websitename.title) !== -1) {
					userpref.disabledon.splice(userpref.disabledon.indexOf(websitename.title), 1);
				}
				while (userpref.disabledon.indexOf(domainname.title) !== -1) {
					userpref.disabledon.splice(userpref.disabledon.indexOf(domainname.title), 1);
				}
			} 
			break;
		case 'domain-switch':
			if (event.target.value === '0') {
				userpref.disabledon.push(domainname.title);
			} else {
				while (userpref.disabledon.indexOf(domainname.title) !== -1) {
					userpref.disabledon.splice(userpref.disabledon.indexOf(domainname.title), 1);
				}
			}
			break;
	}
	saveuserpref();
	setuserpref();
});

reloadbutton.addEventListener('click', event => {
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		let tab = tabs[0];
		let tabid = tab.id;
		let taburl = tab.url;
		let root = url2root(taburl);
		//domain upgrade
		if ((root.match(/\/m\.|\.m\.|\/mobile\./) !== null) && (tabid > -1)) {
			let desktopurl = taburl.replace(/m\.|mobile\./, '');
			chrome.tabs.update( tabid, { url: desktopurl } );
		// cache bypass
		} else if (tabid > -1) {
			chrome.tabs.reload(tabid, { "bypassCache": true });
		}
	});
	window.close();
});	

