/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

let gameState = 0;
let board = ['1', '2', '3', '4',
			 '5', '6', '7', '8',
			 '9', 'a', 'b', 'c',
			 'd', 'e', 'f', null];

let holeLoc = 15;

function makeLoc(x,y) {
	return {x, y}
}

const LOCATIONS =  [makeLoc(0,0), makeLoc(1,0), makeLoc(2,0), makeLoc(3,0),
				  	makeLoc(0,1), makeLoc(1,1), makeLoc(2,1), makeLoc(3,1),
				  	makeLoc(0,2), makeLoc(1,2), makeLoc(2,2), makeLoc(3,2),
				  	makeLoc(0,3), makeLoc(1,3), makeLoc(2,3), makeLoc(3,3)]

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
	// Uncomment the following code line
	// to verify operation:

	// PS.debug( "PS.init() called\n" );

	// This function should normally begin
	// with a call to PS.gridSize( x, y )
	// where x and y are the desired initial
	// dimensions of the grid.
	// Call PS.gridSize() FIRST to avoid problems!
	// The sample call below sets the grid to the
	// default dimensions (8 x 8).
	// Uncomment the following code line and change
	// the x and y parameters as needed.

	PS.gridSize( 4, 4 );

	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	PS.statusText( "Click to Start" );
	// loadImages();
	loadBoard();
	PS.seed(PS.date().time);
	// PS.imageLoad("1.png", (img) => {PS.imageBlit(img, 0, 0)});

	// Add any other initialization code you need here.
	
};

function loadBoard() {
	for (let i = 0; i < 16; i++) {
		if (board[i] != null) {
			PS.color(LOCATIONS[i].x, LOCATIONS[i].y, PS.COLOR_CYAN);
			PS.glyph(LOCATIONS[i].x, LOCATIONS[i].y, `${board[i]}`);
			PS.border(LOCATIONS[i].x, LOCATIONS[i].y, 2);
		} else {
			PS.color(LOCATIONS[i].x, LOCATIONS[i].y, PS.COLOR_WHITE)
			PS.glyph(LOCATIONS[i].x, LOCATIONS[i].y, 0);
			PS.border(LOCATIONS[i].x, LOCATIONS[i].y, 1);
		}
	}
}

function locToArr(x, y) {
	return y*4+x;
}

function upMove() {
	let pX = LOCATIONS[holeLoc].x;
	let pY = LOCATIONS[holeLoc].y + 1;

	if (pY > 3) {
		return;
	}

	let pArr = locToArr(pX, pY);

	board[holeLoc] = board[pArr];
	board[pArr] = null;
	holeLoc = pArr;
}

function downMove() {
	let pX = LOCATIONS[holeLoc].x;
	let pY = LOCATIONS[holeLoc].y - 1;

	if (pY < 0) {
		return;
	}

	let pArr = locToArr(pX, pY);

	board[holeLoc] = board[pArr];
	board[pArr] = null;
	holeLoc = pArr;
}

function rightMove() {
	let pX = LOCATIONS[holeLoc].x - 1;
	let pY = LOCATIONS[holeLoc].y;

	if (pX < 0) {
		return;
	}

	let pArr = locToArr(pX, pY);

	board[holeLoc] = board[pArr];
	board[pArr] = null;
	holeLoc = pArr;
}

function leftMove() {
	let pX = LOCATIONS[holeLoc].x + 1;
	let pY = LOCATIONS[holeLoc].y;

	if (pX > 3) {
		return;
	}

	let pArr = locToArr(pX, pY);

	board[holeLoc] = board[pArr];
	board[pArr] = null;
	holeLoc = pArr;
}

function checkBoard() {
	for (let i = 1; i <= 9; i ++) {
		if (board[i-1] != i) {
			return;
		}
	}
	if (board[9] != 'a' || board[10] != 'b' || board[11] != 'c' || board[12] != 'd' || board[13] != 'e' || board[14] != 'f') {
		return;
	}

	for (let i = 0; i < 15; i++) {
		PS.color(LOCATIONS[i].x, LOCATIONS[i].y, PS.COLOR_GREEN);
		PS.statusText("You Win! Click to Play again!");
		gameState = 0;
	}
}

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.

	if (gameState == 0) {
		for (let i = 0; i < 1000; i++) {
			const rand = PS.random(4);
			if (rand == 1) {
				upMove();
			} else if (rand == 2) {
				downMove();
			} else if (rand == 3) {
				rightMove();
			} else {
				leftMove();
			}
		}
		gameState = 1;
		PS.statusText("Good Luck!");
		loadBoard();
	} else {
		let arrLoc = locToArr(x,y);
		if (x > 0 && arrLoc - 1 == holeLoc) {
			leftMove();
		} else if (x < 3 && arrLoc + 1 == holeLoc) {
			rightMove();
		} else if (y > 0 && arrLoc - 4 == holeLoc) {
			upMove();
		} else if (y < 3 && arrLoc + 4 == holeLoc) {
			downMove();
		}
		loadBoard();
		checkBoard();
	}
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	if (key == 114) {
		PS.statusInput("Enter seed", (seed) => {
			PS.seed(strHash(seed));
		})
	}

	if (gameState == 0) {
		return;
	}

	if (key == 1008 || key == 115) {
		downMove();
	}
	if (key == 1006 || key == 119) {
		upMove();
	}
	if (key == 1007 || key == 100) {
		rightMove();
	}
	if (key == 1005 || key == 97) {
		leftMove();
	}

	loadBoard();
	checkBoard();
	// Add code here for when a key is pressed.
};

function strHash(str) {
	var hash = 0,
	  i, chr;
	if (str.length === 0) return hash;
	for (i = 0; i < str.length; i++) {
	  chr = str.charCodeAt(i);
	  hash = ((hash << 5) - hash) + chr;
	  hash |= 0; // Convert to 32bit integer
	}
	return hash;
  }

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

