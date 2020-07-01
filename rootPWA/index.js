// focus to iframe
setTimeout(() => {
  document.getElementById('appwindow').focus();
}, 500);

// register service workers
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./install.js');
} else {
	console.log('serice worker not supported');
}