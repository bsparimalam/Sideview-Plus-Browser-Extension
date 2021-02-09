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
			chrome.browserAction.getBadgeText({'tabId': tabid}, result => {
				if (result === "M") {
					fluidstatus.innerText = "ON";
					fluidstatus.style.color = 'green';
				} else if (result === "1") {
					document.getElementsByClassName('overlay')[0].style.display = "block";
				} else {
					fluidstatus.innerText = "OFF";
					fluidstatus.style.color = 'red';
				}
			});
			let taburl = tab.url;
			let domain = url2domain(taburl);
			let website = url2root(taburl);
			let page = url2page(taburl);
			pagename.title = page;
			websitename.title = website;
			websitename.innerText = website.slice(0, 20);
			domainname.title = domain;
			domainname.innerText = domain.slice(0, 20);
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
			let reflows = userpref.totalreflows;

			if (host === "Firefox") {
				shortcuttext.innerHTML = "See/modify keyboard shortcuts via <br>about:addons > ☸ > manage extension shortcuts";
				shortcuttext.href = "about:addons";
				shortcuttext.style.fontSize = "0.28cm";
				ratebutton.href = "https://addons.mozilla.org/en-CA/firefox/addon/mini-browser-for-multitasking/";
			} else if (host === "Edg") {
				shortcuttext.innerText = "See/modify keyboard shortcuts";
				shortcuttext.href = "edge://extensions/shortcuts";
				ratebutton.href = "https://microsoftedge.microsoft.com/addons/detail/reflow-for-multitasking/ngocckbdkjpgidpachimbiaphcgjgoaa";
			} else {
				shortcuttext.innerText = "See/modify keyboard shortcuts";
				shortcuttext.href = "chrome://extensions/shortcuts";
				ratebutton.href = "https://chrome.google.com/webstore/detail/reflow-for-multitasking/cgkfhhagdgcjcjdkcbpohhhidlibblkn/reviews?utm_source=rateus";
			}
		});
	});
}

// not duplicate
ratebutton = document.getElementById('rateus');
shortcuttext = document.getElementsByClassName('shortcuttext')[0];
fluidstatus = document.getElementById('fluidstatus');
pagename = document.getElementById('page');
websitename = document.getElementById('website');
domainname =  document.getElementById('domain');
pageswitch = document.getElementById('page-switch');
websiteswitch = document.getElementById('website-switch');
domainswitch = document.getElementById('domain-switch');
widthslider = document.getElementById('width-slider');
schematic = document.getElementById('schematic');
reloadbutton = document.getElementById('reload');
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
	setInterval(() => {
		reloadbutton.style.color = 'red';
		setTimeout(() => {
			reloadbutton.style.color = 'white';
		}, 300);
	}, 600);
});

document.addEventListener('click', event => {
	switch(event.target.getAttribute('message')) {
		case 'reload': case 'contribute': case 'newtab73': case 'newtab11':
		case 'thistab73': case 'thistab11': case 'recombine': case 'modifyshortcuts':
			// god knows why but this fixes the issues when multiple windows are open
			chrome.windows.getCurrent(thiswindow => {
				chrome.runtime.sendMessage(event.target.getAttribute('message'));
			});
			window.close();
			break;
	}
});