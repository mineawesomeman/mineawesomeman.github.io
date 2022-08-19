var wordsLoaded = false;
var words = new Set();

var client = new XMLHttpRequest();
client.open('GET', 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt');
client.onreadystatechange = function() {
	if (client.readyState === 4) {
		handleResponseText(client.responseText);
	}
}
client.send();

function handleResponseText(responseText) {
	var a = responseText.match(/[a-z'\-]+/gi);
	for (var i = 0; i < a.length; i++) {
		words.add(a[i]);
	}
	wordsLoaded = true;
	console.log("words loaded!");
}

function analyzeText() {
	if (wordsLoaded == false) {
		document.getElementById("output-text").innerHTML = "Word Database Unable To Load. Try Again Later!";
		return;
	}
	
	var inputText = document.getElementById("input-text").value;
	var inputWords = inputText.match(/[a-z'\-]+/gi);
	
	var outputText = "";
	
	for (var i = 0; i < inputWords.length; i++) {
		if (words.has(inputWords[i].toLowerCase())) {
			outputText += inputWords[i];
		} else {
			outputText += "<span class=\"red\">";
			outputText += inputWords[i];
			outputText += "</span>";
		}
		
		outputText += " ";
	}
	
	document.getElementById("output-text").innerHTML = "Output:";
	document.getElementById("output").innerHTML = outputText;
}