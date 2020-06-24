
let currentua = navigator.userAgent;
let temp = currentua.split(' ');
temp = temp[temp.length-1];
temp = temp.split('/');
let host = temp[0];

let minibrowser = {
	"outerBounds": {
		"width": 500,
		"height": 700
	}
}

let searchengine;

if (host === 'OPR') {
	searchengine = 'bing';
} else {
	searchengine = 'google'
}

chrome.app.runtime.onLaunched.addListener(() => {
	chrome.app.window.create("./engine/engine.html?minibrowse=https://${searchengine}.com/", minibrowser);
});
