
let currentua = navigator.userAgent;
let temp = currentua.split(' ');
temp = temp[temp.length-1];
temp = temp.split('/');
let host = temp[0];
let popup = document.getElementById('html');
if (host === 'Firefox') {
	popup.style.width = '8cm';
	popup.style.height = '14cm';
} else {
	popup.style.width = '10cm';
	popup.style.height = '16cm';
}
document.getElementById('popupwindow').addEventListener('load', event => {
	event.target.focus();
});
