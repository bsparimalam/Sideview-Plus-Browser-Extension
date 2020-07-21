
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

