
storagename = 'reflow.1.0';

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
function stripprotocol(string) {
	return string.replace(/https:\/\/|http:\/\//, '');
}
function gethost() {
	let hostua = navigator.userAgent;
	let temp = hostua.split('/');
	host = temp[temp.length-2];
	return host.split(' ')[1];
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