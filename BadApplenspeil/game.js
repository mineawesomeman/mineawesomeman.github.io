"use strict";

let frames = Array.apply(null, Array(6566)).map(function () {}); //initize empty array of size 6566, which will have all the loaded images
let loadCount = 0; //this keeps track of how many frames have been loaded
let currentFrame = 0;
let timer = null;
let audioChannel = null;

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.init = function( system, options ) {

	//setup the grid
	PS.gridSize( 32, 24 );
	for (let i = 0; i < 32; i++) {
		for (let j = 0; j < 24; j++) {
			PS.color(i, j, PS.COLOR_WHITE);
			PS.border(i, j, 0);
		}
	}

	//let the user know that we need to load some stuff lol
	PS.statusText( "Loading..." );
	PS.gridRefresh(); 

	PS.audioLoad( "bad_apple", {
		lock : true,
		onLoad : (data) => {
			audioChannel = data.channel;
		} 
	} );

	//load all the frames into the array lol
	for (let i = 0; i < 6566; i++) {
		PS.imageLoad(formatNumberToFile(i), (img) => {
			frames[i] = img;
			loadCount++;
			if (loadCount >= 6565) {
				finishLoad();
			}
		});
	}
};

function formatNumberToFile(num) {
	let numStr = num.toLocaleString(undefined, {minimumIntegerDigits: 6, useGrouping: false});
	return `frames/bad-apple_${numStr}.bmp`
}

function finishLoad() {
	PS.statusText( "BadApplenspeil" );
	PS.imageBlit(frames[0], 0, 0);
	PS.audioPlayChannel (audioChannel);
	timer = PS.timerStart(3, nextFrame);
	PS.gridRefresh();
}

function nextFrame() {
	currentFrame++;
	if (currentFrame < 6566) {
		PS.imageBlit(frames[currentFrame], 0, 0);
		PS.gridRefresh();
	}
}

