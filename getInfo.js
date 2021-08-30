/*
I know this code is really bad

I'm not a web designer and I haven't touched js in nearly 4 years.
But it ain't broke.

<3 -David
*/


function init() {
	const date = new Date();
	document.write("<h1>Welcome to the WPI Shuttle Locator!</h1>");
	document.write("<h3>Current time: " + timeToStr(date, true) + "</h3>");
	if (date.getHours() < 7 || date.getHours() >= 18 || date.getDay() == 0 || date.getDay() == 6) {
		document.write("<p>Shuttle is not running!</p>");
		return;
	}
	const locs = getNextLocs();
	
	if (locs[0].AD == "a") {
		document.write("<p style=\"font-size:150%\">The Shuttle will be <span style=\"color:green\">arriving</span> at <b>" + locs[0].name + "</b> at " + timeToStr(locs[0].time, false));
	} else {
		document.write("<p style=\"font-size:150%\">The Shuttle will be <span style=\"color:red\">departing</span> from <b>" + locs[0].name + "</b> at " + timeToStr(locs[0].time, false));
	}
	
	//document.write("<p>Next arrivals:</p>");
	document.write("<table> <thead>Next arrivals:</thead> <tr> <th>Location Name</th> <th>Arrival Time</th> </tr>");
	
	for (let i = 1; i < locs.length; i++) {
		document.write("<tr> <td>" + locs[i].name + "</td> <td>" + timeToStr(locs[i].time, false) + "</td> </tr>");
	}
	
	document.write("</table>");
	document.write("<p style=\"font-size:75%;color:blue\">Note: this is based on the official schedule. The shuttle may run slightly behind or ahead of schedule!!</p>");
}

function getTime(min) {
	var date = new Date();
	date.setSeconds(00);
	if (min >= 60) {
		min -= 60;
		date.setHours(date.getHours() + 1);
	}
	date.setMinutes(min);
	return date;
}

function timeToStr(time, useSec) {
	hour = time.getHours();
	if (hour < 10) {
		hour = "0" + hour;
	}
	min = time.getMinutes();
	if (min < 10) {
		min = "0" + min;
	}
	sec = time.getSeconds();
	if (sec < 10) {
		sec = "0" + sec;
	}
	if (useSec) {
		return hour + ":" + min + ":" + sec;
	}
	return hour + ":" + min;
}

function getNextLocs() {
	var mode = 0;
	var loc = "";
	var ret = [];
	const time = new Date();
	
	const times = [0, 1, 3, 5, 10, 11, 13, 14, 17, 18, 20, 21, 23, 25, 30, 31, 33, 34, 37, 38, 40];
	const locs = ["Founders Hall", "Founders Hall", "Bartlett Center", "Bartlett Center", "Gateway Lot", "Gateway Lot", "Hampton Inn", "Hampton Inn", "Faraday Hall", "Faraday Hall"];
	const AorD = ["a", "d","a", "d","a", "d","a", "d","a", "d"]
	
	var minStd = time.getMinutes() % 20;
	
	for (let i = 0; i < 21; i++) {
		if (mode == 0 && times[i] > minStd) {
			const newMin = Math.floor(time.getMinutes() / 20) * 20 + times[i];
			const newTime = getTime(newMin);
			
			const toAdd = {name: locs[i%10], AD: AorD[i%10], time: newTime};
			
			ret.push(toAdd);
			mode = 1;
			loc = locs[i%10];
			continue;
		}
		
		if (mode == 1 && AorD[i%10] == "a") {
			if (loc == locs[i%10]) {
				break;
			} else {
				const newMin = Math.floor(time.getMinutes() / 20) * 20 + times[i];
				const newTime = getTime(newMin);
				
				if (newTime.getHours() >= 18) {
					break;
				}
				
				const toAdd = {name: locs[i%10], AD: AorD[i%10], time: newTime};
			
				ret.push(toAdd);
			}
		}
	}
	
	return ret;
}