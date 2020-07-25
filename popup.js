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
	return string.replace(/https:\/\/|http:\/\//, '');
}

//////////////////////////////////////////////////////////////////////////////
function setuserpref() {
	chrome.tabs.query({active:true, currentWindow:true}, tabs => {
		let page = stripprotocol(url2page(tabs[0].url));
		let website = stripprotocol(url2root(tabs[0].url));
		let domain = stripprotocol(url2domain(tabs[0].url));
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
		bugreport.href = `mailto:support@bhar.app?subject=Reflow - bug report - ${website}&body=Hi, I found an issue with the extension. Issue description: `;
		let reflows = userpref.totalreflows;
		if (reflows > 1000000000) {
			usage.innerText = Math.floor(reflows/1000000000) + 'B+ reflows';
		} else if (reflows > 1000000) {
			usage.innerText = Math.floor(reflows/1000000) + 'M+ reflows';
		} else if (reflows > 1000) {
			usage.innerText = Math.floor(reflows/1000) + 'K+ reflows';
		} else {
			usage.innerText = Math.floor(userpref.totalreflows) + ' reflows';
		}
	});
}

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
	chrome.runtime.sendMessage(userpref);
	setuserpref();
});

reloadbutton.addEventListener('click', event => {
	chrome.runtime.sendMessage('reload');
	window.close();
});	

