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
function setuserpref() {
	chrome.tabs.query({active:true, currentWindow:true}, tabs => {
		let tabid = tabs[0].id;
		chrome.tabs.get(tabid, tab => {
			let taburl = tab.url;
			let domain = url2domain(taburl);
			let website = url2root(taburl);
			let page = url2page(taburl);
			pagename.title = page;
			websitename.title = website;
			websitename.innerText = website.slice(0, 24);
			domainname.title = domain;
			domainname.innerText = domain.slice(0, 24);
			widthslider.value = userpref.widthcutoff;
			if (page === website) {
				pageswitch.disabled = true;
				pagename.style.color = 'var(--disabled)';
			}
			if (website ===  domain) {
				websiteswitch.disabled = true;
				websitename.innerText = 'subdomain';
				websitename.style.color = 'var(--disabled)';
			}
			if (domain.indexOf('.') > -1) {
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
			} else {
				pageswitch.disabled = true;
				websiteswitch.disabled = true;
				domainswitch.disabled = true;
				websitename.innerText = 'subdomain';
				domainname.innerText = 'domain';
				pagename.style.color = 'var(--disabled)';
				websitename.style.color = 'var(--disabled)';
				domainname.style.color = 'var(--disabled)';
				pageswitch.value = 0;
				websiteswitch.value = 0;
				domainswitch.value = 0;
			}
			bugreport.href = `mailto:support@bhar.app?subject=Reflow - bug report - ${website} - &body=Hi, I found an issue with the extension. Issue description: useragent: ${navigator.userAgent}`;
			let reflows = userpref.totalreflows;
			if (reflows > 1000000000) {
				usage.innerText = Math.floor(reflows/1000000000) + 'B+';
			} else if (reflows > 1000000) {
				usage.innerText = Math.floor(reflows/1000000) + 'M+';
			} else if (reflows > 1000) {
				usage.innerText = Math.floor(reflows/1000) + 'K+';
			} else {
				usage.innerText = Math.floor(userpref.totalreflows) + '';
			}
			if (host === "Firefox") {
				promo.href = "https://addons.mozilla.org/en-CA/firefox/addon/mini-browser-for-multitasking/";
			} else if (host === "Edg") {
				promo.href = "https://microsoftedge.microsoft.com/addons/detail/reflow-for-multitasking/ngocckbdkjpgidpachimbiaphcgjgoaa";
			} else {
				promo.href = "https://chrome.google.com/webstore/detail/reflow-for-multitasking/cgkfhhagdgcjcjdkcbpohhhidlibblkn?utm_source=reflow";
			}
		});
	});
}

// not duplicate
document.getElementById('name').innerText = chrome.i18n.getMessage('name');
document.getElementById('none').innerText = chrome.i18n.getMessage('none');
document.getElementById('some').innerText = chrome.i18n.getMessage('some');
document.getElementById('more').innerText = chrome.i18n.getMessage('more');
document.getElementById('all').innerText = chrome.i18n.getMessage('all');
document.getElementById('reflowon').innerText = chrome.i18n.getMessage('reflowon');
document.getElementById('page').innerText = chrome.i18n.getMessage('page');
document.getElementById('reload').innerText = chrome.i18n.getMessage('reload');
document.getElementById('bugreport').innerText = chrome.i18n.getMessage('bugreport');
document.getElementById('reflows').innerText = chrome.i18n.getMessage('reflows');
document.getElementById('bharapp').innerText = chrome.i18n.getMessage('bharapp');

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
promo = document.getElementById('bharapp');
host = gethost();
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
	chrome.runtime.sendMessage(userpref);
	setuserpref();
});

reloadbutton.addEventListener('click', event => {
	chrome.runtime.sendMessage('reload');
	window.close();
});	

