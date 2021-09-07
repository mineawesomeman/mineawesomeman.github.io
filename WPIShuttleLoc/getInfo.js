/*
I know this code is really bad
I'm not a web designer and I haven't touched js in nearly 4 years.
But it ain't broke.
Update it is now slightly less bad? Woo?
<3 -David
*/

function getTime(min, time) {
	var date = new Date(time.getYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes());
	if (min >= 60) {
		min -= 60;
		date.setHours(date.getHours() + 1);
	}
	date.setMinutes(min);
	return date;
}

function timeToStr(time, useSec) {
	var militaryTime = document.forms["options"][0].checked;
	var half = '';
	
	var hour = time.getHours();
	if (!militaryTime) {
		half = 'AM';
		if (hour >= 12) {
			half = 'PM';
			if (hour >= 13) {
				hour -= 12;
			}
		}
		if (hour == 0) {
			hour = 12;
		}
	}	
	
	if (hour < 10) {
		hour = "0" + hour;
	}
	
	var min = time.getMinutes();
	if (min < 10) {
		min = "0" + min;
	}
	
	var sec = time.getSeconds();
	if (sec < 10) {
		sec = "0" + sec;
	}
	if (useSec) {
		return hour + ":" + min + ":" + sec + " " + half;
	}
	
	
	return hour + ":" + min + " " + half;
}

function getNextLocs(time) {
	var mode = 0;
	var loc = "";
	var ret = [];
	
	const times = [0, 1, 3, 5, 10, 11, 13, 14, 17, 18, 20, 21, 23, 25, 30, 31, 33, 34, 37, 38, 40];
	const locs = ["Founders Hall", "Founders Hall", "Bartlett Center", "Bartlett Center", "Gateway Lot", "Gateway Lot", "Hampton Inn", "Hampton Inn", "Faraday Hall", "Faraday Hall"];
	const AorD = ["a", "d","a", "d","a", "d","a", "d","a", "d"]
	
	var minStd = time.getMinutes() % 20;
	
	for (let i = 0; i < 21; i++) {
		if (mode == 0 && times[i] > minStd) {
			const newMin = Math.floor(time.getMinutes() / 20) * 20 + times[i];
			const newTime = getTime(newMin, time);
			
			const toAdd = {name: locs[i%10], AD: AorD[i%10], time: newTime};
			
			console.debug(toAdd);
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
				const newTime = getTime(newMin, time);
				
				if (newTime.getHours() >= 18) {
					break;
				}
				
				const toAdd = {name: locs[i%10], AD: AorD[i%10], time: newTime};
			
				console.debug(toAdd);
				ret.push(toAdd);
			}
		}
	}
	
	return ret;
}

function init() {
	const url = document.URL.toString();
	
	if (url.substring(url.length - 3, url.length - 2) == ":"){
		update(true, url.substring(url.length-5));
	}
	else {
		update(true, "")
		setInterval(update, 1000, true, "");
	}
}

function update(force, time) {
	const now = new Date();
	
	if (time != "") {
		now.setHours(time.substring(0,2));
		now.setMinutes(time.substring(3));
		now.setMonth(9);
		now.setDate(1);
	}
	
	const timeObj = document.getElementById("time");
	timeObj.innerHTML = timeToStr(now, true);
	
	if (now.getSeconds() == 0 || force) {
		if (!(now.getHours() < 7 || now.getHours() >= 18 || now.getDay() == 0 || now.getDay() == 6)) {
			times = getNextLocs(now);
			document.getElementById("no_shuttle").style.visibility = "hidden";
			document.getElementById("next_loc").style.visibility = "";
			document.getElementById("notice").style.visibility = "";
			document.getElementById("location").innerHTML = times[0].name;
			document.getElementById("nextTime").innerHTML = timeToStr(times[0].time, false);
			const arrEle = document.getElementById("arrive");
			const atEle = document.getElementById("at");
			if (times[0].AD == 'd') {
				arrEle.innerHTML = "departing";
				arrEle.style.color = "red";
				atEle.innerHTML = "from";
			} else {
				arrEle.innerHTML = "arriving";
				arrEle.style.color = "green";
				atEle.innerHTML = "at";
			}
			
			var tableString = "<tr> <th>Location</th> <th>Time</th></tr>";
			
			for (var i = 1; i < times.length; i++) {
				tableString += "<tr> <td>" + times[i].name + "</td> <td>" + timeToStr(times[i].time) + "</td> </tr>";
			}
			
			document.getElementById("table").innerHTML = tableString;
			
		} else {
			document.getElementById("no_shuttle").style.visibility = "";
			document.getElementById("next_loc").style.visibility = "hidden";
			document.getElementById("table").innerHTML = "";
			document.getElementById("notice").style.visibility = "hidden";
		}
	}
}
