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

/*
0 - empty space
1 - water
2 - fire
10 - player tank
20 - enemy tank
*/

const MAP1 = [
	[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0],
	[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0],
	[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

let board = MAP1;

function generateFireLocs() {
	let locarr= [];
	for (let i = -3; i <= 3; i++) {
		for (let j = -3; j <= 3; j++) {
			if ((i != 0 || j != 0) && (Math.abs(i) == Math.abs(j) || i == 0 || j == 0)) {
				locarr.push([i, j]);
			}
		}
	}
	return locarr;
}

/*
0 - Player turn, nothing selected
1 - Player turn, something selected
2 - Player turn, chosing where to move
3 - Player turn, chosing where to fire
4 - Enemy turn
5 - End of game
*/
let gameState = 0;

let tanks = [];
let selected = null;

//SOUNDS
let wilhelm = null;
let tada = null;
let click = null;
let move = null;
let blast = null;

//SPRITES
let tankSprites = [];

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

	PS.gridSize( 16, 18 );

	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	PS.statusText( "Your turn" );
	PS.statusColor(PS.COLOR_WHITE);

	PS.gridColor(PS.COLOR_GRAY_DARK);

	let currID = 0;

	for (let i = 0; i < 16; i++) {
		for (let j = 0; j < 18; j++) {
			PS.color(i, j, PS.COLOR_GRAY_DARK);
			let border = PS.border(i, j, 0);
			if (i == 0 && j <= 15) {
				border.left = 2;
			} else if (i == 15 && j <= 15) {
				border.right = 2;
			}

			if (j == 0) {
				border.top = 2;
			} else if (j == 15) {
				border.bottom = 2;
			}

			PS.border(i, j, border);
			PS.borderColor(i, j, PS.COLOR_WHITE);

			if (j <= 15) {
				const space = board[j][i];
				if (space == 1) {
					PS.color(i, j, PS.COLOR_BLUE);
				}
				if (space == 10) {
					PS.color(i, j, PS.COLOR_VIOLET);
					tanks.push({x: i, y: j, owner: 1, id: currID});
					tankSprites.push(null);
					currID++;
				}
				if (space == 20) {
					PS.color(i, j, PS.COLOR_YELLOW);
					tanks.push({x: i, y: j, owner: 2, id: currID});
					tankSprites.push(null);
					currID++;
				}
			}
		}
	}

	PS.imageLoad('sprites/tank-y.png', (image) => {
		for (let i = 0; i < tanks.length; i++) {
			if (tanks[i].owner == 1) {
				PS.debug("spawning sprite");
				tankSprites[i] = PS.spriteImage(image);
				PS.spriteAxis(tankSprites[i], tanks[i].x, tanks[i].y);
				PS.spriteShow(tankSprites[i]);
			}
		}
	});

	PS.imageLoad('sprites/tank-e.png', (image) => {
		for (let i = 0; i < tanks.length; i++) {
			if (tanks[i].owner == 2) {
				PS.debug("spawning sprite");
				tankSprites[i] = PS.spriteImage(image);
				PS.spriteAxis(tankSprites[i], tanks[i].x, tanks[i].y);
				PS.spriteShow(tankSprites[i]);
			}
		}
	});

	PS.audioLoad('fx_click', {
		onLoad: (data) => {
			click = data.channel;
		}
	});

	PS.audioLoad('fx_jump2', {
		onLoad: (data) => {
			move = data.channel;
		}
	});

	PS.audioLoad('fx_blast2', {
		onLoad: (data) => {
			blast = data.channel;
		}
	});

	PS.audioLoad('fx_tada', {
		onLoad: (data) => {
			tada = data.channel;
		}
	});

	PS.audioLoad('fx_wilhelm', {
		onLoad: (data) => {
			wilhelm = data.channel;
		}
	})

	// Add any other initialization code you need here.
	
};

function displayOptions() {
	PS.color(1, 17, PS.COLOR_CYAN);
	PS.color(2, 17, PS.COLOR_CYAN);
	PS.color(3, 17, PS.COLOR_CYAN);
	PS.color(4, 17, PS.COLOR_CYAN);
	PS.color(5, 17, PS.COLOR_CYAN);
	PS.color(6, 17, PS.COLOR_CYAN);

	PS.glyph(2, 17, 'M');
	PS.glyph(3, 17, 'O');
	PS.glyph(4, 17, 'V');
	PS.glyph(5, 17, 'E');

	PS.color(9, 17, PS.COLOR_CYAN);
	PS.color(10, 17, PS.COLOR_CYAN);
	PS.color(11, 17, PS.COLOR_CYAN);
	PS.color(12, 17, PS.COLOR_CYAN);
	PS.color(13, 17, PS.COLOR_CYAN);
	PS.color(14, 17, PS.COLOR_CYAN);

	PS.glyph(10, 17, 'F');
	PS.glyph(11, 17, 'I');
	PS.glyph(12, 17, 'R');
	PS.glyph(13, 17, 'E');
}

function hideOptions() {
	for (let i = 0; i < 16; i++) {
		PS.color(i, 17, PS.COLOR_GRAY_DARK);
		PS.glyph(i, 17, '');
	}
}

const MOVELOCS = [[1,0], [2,0], [1,1], [1, -1], [0, 1], [0,2], [0,-1], [0,-2], [-1, 1], [-1, 0], [-1, -1], [-2, 0]];

function showMovement() {
	const tankX = selected.x;
	const tankY = selected.y;

	for (let i = 0; i < MOVELOCS.length; i++) {
		const spotX = tankX + MOVELOCS[i][0];
		const spotY = tankY + MOVELOCS[i][1];

		if (!(spotX < 0 || spotX > 15 || spotY < 0 || spotY > 15)) {
			if (board[spotY][spotX] == 0) {
				PS.glyph(spotX, spotY, '•');
				PS.glyphColor(spotX, spotY, PS.COLOR_GREEN);
			}
		}
	}

	PS.audioPlayChannel(click);
	PS.gridRefresh();
}

function hideMovement() {
	const tankX = selected.x;
	const tankY = selected.y;

	for (let i = 0; i < MOVELOCS.length; i++) {
		const spotX = tankX + MOVELOCS[i][0];
		const spotY = tankY + MOVELOCS[i][1];

		if (spotX >= 0 && spotX <= 15 && spotY >= 0 && spotY <= 15) {
			PS.glyph(spotX, spotY, '');
		}
	}
}

function moveTank(tank, x, y) {
	PS.color(tank.x, tank.y, PS.COLOR_GRAY_DARK);
	board[tank.y][tank.x] = 0;

	tanks[tank.id].x = x;
	tanks[tank.id].y = y;
	board[y][x] = 10;

	PS.color(x, y, PS.COLOR_VIOLET);
}

const FIRELOCS = generateFireLocs();

function showFire() {
	const tankX = selected.x;
	const tankY = selected.y;

	for (let i = 0; i < FIRELOCS.length; i++) {
		const spotX = tankX + FIRELOCS[i][0];
		const spotY = tankY + FIRELOCS[i][1];

		if (!(spotX < 0 || spotX > 15 || spotY < 0 || spotY > 15)) {
			const spot = board[spotY][spotX];
			if (spot == 0 || spot == 10 || spot == 20) {
				PS.glyph(spotX, spotY, 'X');
				PS.glyphColor(spotX, spotY, PS.COLOR_RED);
			}
		}
	}

	PS.audioPlayChannel(click);
	PS.gridRefresh();
}

function hideFire() {
	const tankX = selected.x;
	const tankY = selected.y;

	for (let i = 0; i < FIRELOCS.length; i++) {
		const spotX = tankX + FIRELOCS[i][0];
		const spotY = tankY + FIRELOCS[i][1];

		PS.glyph(spotX, spotY, '');
	}
}

function fire(x, y) {
	for (let i = 0; i < tanks.length; i++) {
		if (tanks[i] == null) continue;
		if (tanks[i].x == x && tanks[i].y == y) {
			tanks[i] = null;
		}
	}

	board[y][x] = 2;

	// PS.audioPlayChannel(blast);
	PS.color(x, y, PS.COLOR_RED);
}

function enemyTurn() {
	setTimeout(enemySelectTank, 500);
	PS.gridRefresh();
}

function disanceBetween(tank1, tank2) {
	const x = Math.pow(tank1.x - tank2.x, 2);
	const y = Math.pow(tank1.y - tank2.y, 2);
	return Math.sqrt(x + y);
}

function enemySelectTank() {
	let myTanks = [];
	for (let i = 0; i < tanks.length; i++) {
		if (tanks[i] == null) continue;
		if (tanks[i].owner == 2) {
			myTanks.push(tanks[i]);
		} 
	}

	const tankNum = PS.random(myTanks.length) - 1;
	PS.color(myTanks[tankNum].x, myTanks[tankNum].y, PS.COLOR_ORANGE);
	selected = myTanks[tankNum];
	PS.audioPlayChannel(click);

	let closestTank = null;
	let closestDistance = 100000;
	for (let i = 0; i < tanks.length; i++) {
		if (tanks[i] == null || tanks[i].owner == 2) continue;
		if (closestTank == null) {
			closestTank = tanks[i];
			closestDistance = disanceBetween(tanks[i], selected);
		} else {
			const newDist = disanceBetween(tanks[i], selected);
			if (newDist < closestDistance) {
				closestTank = tanks[i];
				closestDistance = newDist;
			}
		}
	}

	let toFire = false;

	const tankX = selected.x;
	const tankY = selected.y;
	let spotX = 0;
	let spotY = 0;
	for (let i = 0; i < FIRELOCS.length; i++) {
		spotX = tankX + FIRELOCS[i][0];
		spotY = tankY + FIRELOCS[i][1];

		if (spotX == closestTank.x && spotY == closestTank.y) {
			toFire = true;
			break;
		}
	}

	if (toFire) {
		setTimeout(showFire, 750);
		setTimeout(enemyFire, 1500, closestTank);
	} else {
		setTimeout(showMovement, 750);
		setTimeout(enemyMove, 1500, closestTank);
	}
	PS.gridRefresh();
}

function enemyMove(target) {
	hideMovement();

	const tankX = selected.x;
	const tankY = selected.y;

	let bestSpot = null;
	let bestSpotDist = 1000;

	for (let i = 0; i < MOVELOCS.length; i++) {
		const spotX = tankX + MOVELOCS[i][0];
		const spotY = tankY + MOVELOCS[i][1];
		
		if (!(spotX < 0 || spotX > 15 || spotY < 0 || spotY > 15)) {
			if (board[spotY][spotX] == 0) {
				if (bestSpot == null) {
					bestSpot = {x: spotX, y: spotY};
					bestSpotDist = disanceBetween(bestSpot, target);
				} else {
					const newDist = disanceBetween({x: spotX, y: spotY}, target);

					if (newDist < bestSpotDist) {
						bestSpot = {x: spotX, y: spotY};
						bestSpotDist = newDist;
					}
				}
			}
		}
	}

	PS.color(selected.x, selected.y, PS.COLOR_GRAY_DARK);
	board[selected.y][selected.x] = 0;

	tanks[selected.id].x = bestSpot.x;
	tanks[selected.id].y = bestSpot.y;

	PS.color(bestSpot.x, bestSpot.y, PS.COLOR_YELLOW);
	board[bestSpot.y][bestSpot.x] = 20;

	PS.statusText("Your Turn");
	gameState = 0;
	selected = null;

	PS.audioPlayChannel(move);
	PS.gridRefresh();
}

function enemyFire(tank) {
	PS.color(tank.x, tank.y, PS.COLOR_RED);
	tanks[tank.id] = null;
	board[tank.y][tank.x] = 2;

	PS.color(selected.x, selected.y, PS.COLOR_YELLOW);
	hideFire();

	let playersLeft = false;
	for (let i = 0; i < tanks.length; i++) {
		if (tanks[i] == null || tanks[i].owner == 2) continue;
		playersLeft = true;
		break;
	}

	if (playersLeft) {
		PS.statusText("Your Turn");
		gameState = 0;
	} else {
		gameState = 5;
	}

	selected = null;
	PS.audioPlayChannel(blast, {
		onEnd: () => {
			if (gameState == 5) {
				PS.audioPlayChannel(wilhelm);
				PS.statusText("Enemy Wins!!!");
			}
		}
	});
	PS.gridRefresh();
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
	// PS.debug(`${x}, ${y} at ${gameState}\n`)

	if (gameState == 2) {
		const tankX = selected.x;
		const tankY = selected.y;
		let clicked = false;

		for (let i = 0; i < MOVELOCS.length; i++) {
			const spotX = tankX + MOVELOCS[i][0];
			const spotY = tankY + MOVELOCS[i][1];
			

			if (x == spotX && y == spotY && !(spotX < 0 || spotX > 15 || spotY < 0 || spotY > 15)) {
				if (board[spotY][spotX] == 0) {
					clicked = true;
					hideMovement();
					moveTank(selected, spotX, spotY);
					PS.statusText("Enemy Turn");
					PS.audioPlayChannel(move);
					hideOptions();
					gameState = 4;
					selected = null;
					enemyTurn();
				}
			}
		}

		// PS.debug(`gs2, clicked: ${clicked}, x: ${x}, y: ${y}\n`);

		if (!clicked) {
			// PS.debug(`${selected}\n`);
			hideMovement();

			if (y == 17 && x >= 10 && x <= 14) {
				gameState = 3;

				for (let i = 1; i <= 6; i++) {
					PS.color(i, 17, PS.COLOR_CYAN);
				}

				for (let i = 9; i <= 14; i++) {
					PS.color(i, 17, PS.COLOR_RED);
				}
				PS.statusText("Choose where to fire to");
				showFire();
			} else {
				PS.color(selected.x, selected.y, PS.COLOR_VIOLET);
			
				PS.statusText("Your Turn");
				hideOptions();
				gameState = 0;
				selected = null;
			}
		}
		return;
	}

	if (gameState == 3) {
		const tankX = selected.x;
		const tankY = selected.y;
		let clicked = false;

		for (let i = 0; i < FIRELOCS.length; i++) {
			const spotX = tankX + FIRELOCS[i][0];
			const spotY = tankY + FIRELOCS[i][1];
			

			if (x == spotX && y == spotY && !(spotX < 0 || spotX > 15 || spotY < 0 || spotY > 15)) {
				const spot = board[spotY][spotX];
				if (spot == 0 || spot == 20 || spot == 10) {
					clicked = true;
					hideFire();
					fire(spotX, spotY);
					PS.statusText("Your Turn");
					hideOptions();
					PS.color(tankX, tankY, PS.COLOR_VIOLET);

					let enemiesLeft = false;

					for (let i = 0; i < tanks.length; i++) {
						if (tanks[i] == null || tanks[i].owner == 1) continue;
						enemiesLeft = true;
						break;
					}
					
					selected = null;

					if (enemiesLeft) {
						gameState = 4;
						enemyTurn();
					} else {
						gameState = 5;
					}
					PS.audioPlayChannel(blast, {
						onEnd: () => {
							if (gameState == 5) {
								PS.statusText("You win!!!!!");
								PS.audioPlayChannel(tada);
							}
						}
					})
					
				}
			}
		}

		if (!clicked) {
			// PS.debug(`${selected}\n`);
			hideFire();

			if (y == 17 && x >= 1 && x <= 6) {
				gameState = 2;

				for (let i = 1; i <= 6; i++) {
					PS.color(i, 17, PS.COLOR_GREEN);
				}

				for (let i = 9; i <= 14; i++) {
					PS.color(i, 17, PS.COLOR_CYAN);
				}
				PS.statusText("Moving Tank");
				showMovement();
			} else {
				PS.color(selected.x, selected.y, PS.COLOR_VIOLET);
			
				PS.statusText("Your Turn");
				hideOptions();
				gameState = 0;
				selected = null;
			}
		}
		return;
	}

	if ((gameState == 1 || gameState == 2 || gameState == 3) && y == 17) {
		
		if (x >= 1 && x <= 6) {
			gameState = 2;

			for (let i = 1; i <= 6; i++) {
				PS.color(i, 17, PS.COLOR_GREEN);
			}

			for (let i = 9; i <= 14; i++) {
				PS.color(i, 17, PS.COLOR_CYAN);
			}
			PS.statusText("Moving Tank");
			showMovement();
		}

		if (x >= 9 && x <= 14) {
			gameState = 3;

			for (let i = 1; i <= 6; i++) {
				PS.color(i, 17, PS.COLOR_CYAN);
			}

			for (let i = 9; i <= 14; i++) {
				PS.color(i, 17, PS.COLOR_RED);
			}
			PS.statusText("Choose where to fire to");
			showFire();
		}
		
		return;
	}

	if (gameState == 0 || gameState == 1) {
		let selectedSmth = false;
		for (let i = 0; i < tanks.length; i++) {
			if (tanks[i] == null) continue;
			if (tanks[i].x == x && tanks[i].y == y) {
				if (tanks[i].owner == 1) {
					gameState = 1;
					selected = tanks[i];
					PS.color(selected.x, selected.y, PS.COLOR_MAGENTA);
					PS.statusText("Tank Selected - Choose your action");
					displayOptions();
					selectedSmth = true;
				}
			}
		}

		if (!selectedSmth && y < 16 && gameState == 1) {
			if (gameState == 1) {
				PS.color(selected.x, selected.y, PS.COLOR_VIOLET);
			}
			PS.statusText("Your Turn");
			hideOptions();
			gameState = 0;
			selected = null;
		}

		PS.audioPlayChannel(click);
		return;
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
	if (gameState == 1 || gameState == 3) {
		if (y == 17 && x >= 1 && x <= 6) {
			PS.color(1, 17, PS.COLOR_GREEN);
			PS.color(2, 17, PS.COLOR_GREEN);
			PS.color(3, 17, PS.COLOR_GREEN);
			PS.color(4, 17, PS.COLOR_GREEN);
			PS.color(5, 17, PS.COLOR_GREEN);
			PS.color(6, 17, PS.COLOR_GREEN);
		} 
	}

	if (gameState == 1 || gameState == 2) {
		if (y == 17 && x >= 9 && x <= 14) {
			PS.color(9, 17, PS.COLOR_RED);
			PS.color(10, 17, PS.COLOR_RED);
			PS.color(11, 17, PS.COLOR_RED);
			PS.color(12, 17, PS.COLOR_RED);
			PS.color(13, 17, PS.COLOR_RED);
			PS.color(14, 17, PS.COLOR_RED);
		}
	}
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
	if (gameState == 1 || gameState == 3) {
		if (y == 17 && x >= 1 && x <= 6) {
			PS.color(1, 17, PS.COLOR_CYAN);
			PS.color(2, 17, PS.COLOR_CYAN);
			PS.color(3, 17, PS.COLOR_CYAN);
			PS.color(4, 17, PS.COLOR_CYAN);
			PS.color(5, 17, PS.COLOR_CYAN);
			PS.color(6, 17, PS.COLOR_CYAN);
		} 
	}

	if (gameState == 1 || gameState == 2) {
		if (y == 17 && x >= 9 && x <= 14) {
			PS.color(9, 17, PS.COLOR_CYAN);
			PS.color(10, 17, PS.COLOR_CYAN);
			PS.color(11, 17, PS.COLOR_CYAN);
			PS.color(12, 17, PS.COLOR_CYAN);
			PS.color(13, 17, PS.COLOR_CYAN);
			PS.color(14, 17, PS.COLOR_CYAN);
		}
	}
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

	// Add code here for when a key is pressed.
};

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

