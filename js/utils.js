export function loadScript(src) {
	let script = document.createElement('script');
	script.src = src;

	return new Promise(res => {
		script.onload = res;
		document.head.appendChild(script);
	});
}

export function generatePromise() {
	let resolve, reject, promise;
	promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

export function getMinsToHrs(time) {
	const [hours, minutes] = time.split(':');
	return parseInt(hours) * 60 + parseInt(minutes);
}

export function getElapsedMins(startTime, endTime) {
	let startMinutes = getMinsToHrs(startTime);
	let endMinutes = getMinsToHrs(endTime);
	const dayMinutes = 24 * 60;

	return dayMinutes - startMinutes + endMinutes;
}

export function getDates() {
	const startDate = new Date();
	const roundedDate = new Date(Math.round(startDate.getTime() / 300000) * 300000);
	const roundedDateString = `${roundedDate.getHours().toString().padStart(2, '0')}:${roundedDate
		.getMinutes()
		.toString()
		.padStart(2, '0')}`;
	const todayDate = startDate.toLocaleDateString();
	const yesterdayDate = new Date(startDate.getTime() - 86400000).toLocaleDateString();

	return { startDate, roundedDate, roundedDateString, todayDate, yesterdayDate };
}

export function getCookie(cname) {
	let name = cname + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

export function setCookie(cname, cvalue, expMins) {
	const d = new Date();
	d.setTime(d.getTime() + expMins * 60000);
	let expires = 'expires=' + d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}
