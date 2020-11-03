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
			random = Math.random();
			if (random < 0.25) {
				monetize.innerText = "Buy a monitor!";
				monetize.href = "https://www.amazon.com/gp/product/B08BF4CZSV/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B08BF4CZSV&linkCode=as2&tag=bhar-20&linkId=63563e10413ce988daac14c47ff887e6";
			} else if (random < 0.50) {
				monetize.innerText = "Rate the extension!";
				if (host === "Firefox") {
					monetize.href = "https://addons.mozilla.org/en-CA/firefox/addon/mini-browser-for-multitasking/";
				} else if (host === "Edg") {
					monetize.href = "https://microsoftedge.microsoft.com/addons/detail/reflow-for-multitasking/ngocckbdkjpgidpachimbiaphcgjgoaa";
				} else {
					monetize.href = "https://chrome.google.com/webstore/detail/reflow-for-multitasking/cgkfhhagdgcjcjdkcbpohhhidlibblkn/reviews?utm_source=rateus";
				}
			} else if (random < 0.75) {
				monetize.innerText = "Buy me a coffee!";
				monetize.href = "https://paypal.me/bharathyy";
			} else {
				monetize.href = "";
				if (reflows > 1000000000) {
					monetize.innerText = Math.floor(reflows/1000000000) + 'B+' + ' reflows!';
				} else if (reflows > 1000000) {
					monetize.innerText = Math.floor(reflows/1000000) + 'M+' + ' reflows!';
				} else if (reflows > 1000) {
					monetize.innerText = Math.floor(reflows/1000) + 'K+' + ' reflows!';
				} else {
					monetize.innerText = Math.floor(userpref.totalreflows) + '' + ' reflows!';
				}
			}
			if (host === "Firefox") {
				ratebutton.href = "https://addons.mozilla.org/en-CA/firefox/addon/mini-browser-for-multitasking/";
			} else if (host === "Edg") {
				ratebutton.href = "https://microsoftedge.microsoft.com/addons/detail/reflow-for-multitasking/ngocckbdkjpgidpachimbiaphcgjgoaa";
			} else {
				ratebutton.href = "https://chrome.google.com/webstore/detail/reflow-for-multitasking/cgkfhhagdgcjcjdkcbpohhhidlibblkn/reviews?utm_source=rateus";
			}
		});
	});
}

// not duplicate
ratebutton = document.getElementById('rateus');
pagename = document.getElementById('page');
websitename = document.getElementById('website');
domainname =  document.getElementById('domain');
pageswitch = document.getElementById('page-switch');
websiteswitch = document.getElementById('website-switch');
domainswitch = document.getElementById('domain-switch');
widthslider = document.getElementById('width-slider');
schematic = document.getElementById('schematic');
reloadbutton = document.getElementById('reload');
bugreport = document.getElementById('bugreport');
monetize = document.getElementById('monetize');
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
ratebutton.addEventListener('click', event => {
	chrome.runtime.sendMessage('rated');
})
if (userpref.totalreflows/userpref.ratedat > 10) {
	document.getElementsByTagName('body')[0].style.gridTemplateRows = "auto 0 0 0 0 0 0 0 0 0 0 0";
	document.getElementsByClassName('rateus')[0].style.display = "grid";
	widthslider.style.display = "none";
	pagename.style.display = "none";
	websitename.style.display = "none";
	domainname.style.display = "none";
	pageswitch.style.display = "none";
	websiteswitch.style.display = "none";
	domainswitch.style.display = "none";
	widthslider.style.display = "none";
	schematic.style.display = "none";
	reloadbutton.style.display = "none";
	usage.style.display = "none";
	bugreport.style.display = "none";
}