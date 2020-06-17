
// chrome.browserAction.onClicked.addListener(function(tab) {
//   console.log('Turning ' + tab.url + ' red!');
//   chrome.tabs.executeScript({
//     code:
//   });
// });

chrome.webRequest.onHeadersReceived.addListener(
	details => ({
		responseHeaders: details.responseHeaders.filter(header =>
		!['x-frame-options'].includes(header.name.toLowerCase()))
	}),
	{
		urls: ['<all_urls>']
	},
	['blocking', 'responseHeaders']
);
