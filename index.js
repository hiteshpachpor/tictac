/**
* This program is a boilerplate code for the standard tic tac toe game
* Here the “box” represents one placeholder for either a “X” or a “0”
* We have a 2D array to represent the arrangement of X or O is a grid
* 0 -> empty box
* 1 -> box with X
* 2 -> box with O
*
* Below are the tasks which needs to be completed:
* Imagine you are playing with the computer so every alternate move should be done by the computer
* X -> player
* O -> Computer
*
* Winner needs to be decided and has to be flashed
*
* Extra points will be given for approaching the problem more creatively
*
*/

const grid = [];
const GRID_LENGTH = 3;
let turn = 'X';

let _PLAYER = 1;
let _COMPUTER = 2;

/**
 * We will store the state of the game in a variable.
 *
 * 0 = Yet to start
 * 1 = In progress
 * 2 = Finished
 */
let gameState = 0;

// Counter to maintain the number of turns taken
let numberOfTurns = 0;

// Handles the timeout thing before computer plays his turn
let computerIsPlaying = false;

// This sequence tells us which player won the game
const winSequenceOfPlayers = {
    "Player"   : String.prototype.padStart(GRID_LENGTH, _PLAYER),
    "Computer" : String.prototype.padStart(GRID_LENGTH, _COMPUTER)
};

// Store the win routes here
let winRoutes = [];

// Track the Player's progress on the various win routes
let winRouteProgress = [];

// Make the Computer a little more smarter
let defensiveMode = true;
let attackingMode = true;

/**
 * There are a total of 8 combinations through which one can win:
 * 3 rows
 * 3 columns
 * 2 diagonals
 *
 * This function creates a list of all these routes.
 */
let createWinRoutes = function() {
    let leftDiagonalPath = [];
    let rightDiagonalPath = [];

    for (let m = 0; m < GRID_LENGTH; m++) {
        let verticalPath = [];
        let horizontalPath = [];

        for (let n = 0; n < GRID_LENGTH; n++) {
            verticalPath.push([m, n]);
            horizontalPath.push([n, m]);
        }

        leftDiagonalPath.push([m, m]);
        rightDiagonalPath.push([GRID_LENGTH - 1 - m, m]);

        winRoutes.push(verticalPath);
        winRoutes.push(horizontalPath);
    }

    winRoutes.push(leftDiagonalPath);
    winRoutes.push(rightDiagonalPath);

    winRouteProgress = Array(winRoutes.length);
};

createWinRoutes();

function initializeGrid() {
    for (let colIdx = 0;colIdx < GRID_LENGTH; colIdx++) {
        const tempArray = [];
        for (let rowidx = 0; rowidx < GRID_LENGTH;rowidx++) {
            tempArray.push(0);
        }
        grid.push(tempArray);
    }
}

function getRowBoxes(colIdx) {
    let rowDivs = '';

    for(let rowIdx=0; rowIdx < GRID_LENGTH ; rowIdx++ ) {
        let additionalClass = 'darkBackground';
        let content = '';
        const sum = colIdx + rowIdx;
        if (sum%2 === 0) {
            additionalClass = 'lightBackground'
        }
        const gridValue = grid[colIdx][rowIdx];
        if(gridValue === _PLAYER) {
            content = '<span class="cross">X</span>';
        }
        else if (gridValue === _COMPUTER) {
            content = '<span class="cross">O</span>';
        }
        rowDivs = rowDivs + '<div colIdx="'+ colIdx +'" rowIdx="' + rowIdx + '" class="box ' +
            additionalClass + '">' + content + '</div>';
    }
    return rowDivs;
}

function getColumns() {
    let columnDivs = '';
    for(let colIdx=0; colIdx < GRID_LENGTH; colIdx++) {
        let coldiv = getRowBoxes(colIdx);
        coldiv = '<div class="rowStyle">' + coldiv + '</div>';
        columnDivs = columnDivs + coldiv;
    }
    return columnDivs;
}

function renderMainGrid() {
    const parent = document.getElementById("grid");
    const columnDivs = getColumns();
    parent.innerHTML = '<div class="columnsStyle">' + columnDivs + '</div>';
}

function onBoxClick() {
    // Start the game
    gameStarted();

    // If the computer is playing his turn, don't allow player to click
    if (computerIsPlaying) {
        return false;
    }

    var rowIdx = this.getAttribute("rowIdx");
    var colIdx = this.getAttribute("colIdx");

    // If the user is clicking on an already filled cell, ignore this click
    if (grid[colIdx][rowIdx] !== 0) {
        return false;
    }

    let newValue = _PLAYER;
    grid[colIdx][rowIdx] = newValue;
    incrementTurns();
    renderMainGrid();

    // To add a more realistic feel to the game,
    // add a small delay before the computer plays his cell.
    computerIsPlaying = true;
    setTimeout(function() {
        computersTurn();
        addClickHandlers();
    }, 500);
}

function addClickHandlers() {
    var boxes = document.getElementsByClassName("box");
    for (var idx = 0; idx < boxes.length; idx++) {
        boxes[idx].addEventListener('click', onBoxClick, false);
    }
}

/**
 * This function plays a cell on computer's behalf
 */
function computersTurn() {
    if (gameState != 1) {
        return;
    }

    // First randomly select indexes for a cell
    let rx = Math.round(Math.random() * (GRID_LENGTH - 1));
    let ry = Math.round(Math.random() * (GRID_LENGTH - 1));

    let potentialWinningRouteFound = false;

    // If attacking mode is on, if there's a chance for the computer to win, take it
    if (attackingMode && !potentialWinningRouteFound) {
        potentialWinningRouteFound = findPotentialWinningRoute(_COMPUTER, _PLAYER);
    }

    // If defensive mode is on, if there's a chance for the user to win, deny it
    if (defensiveMode && !potentialWinningRouteFound) {
        potentialWinningRouteFound = findPotentialWinningRoute(_PLAYER, _COMPUTER);
    }

    // If a potential winning route is found, computer needs to fill it
    if (potentialWinningRouteFound) {
        // Find the empty cell that computer should fill
        for (let c in potentialWinningRouteFound) {
            let emptyCell = potentialWinningRouteFound[c];
            if (grid[emptyCell[0]][emptyCell[1]] === 0) {
                rx = emptyCell[0];
                ry = emptyCell[1];
            }
        }
    }

    // If the cell is already filled, try again
    if (grid[rx][ry] != 0) {
        computersTurn();
        return;
    }

    grid[rx][ry] = _COMPUTER;

    incrementTurns();
    renderMainGrid();
    computerIsPlaying = false;
}

/**
 * This function finds the cell that the computer must fill to stay in the game
 */
function findPotentialWinningRoute(opponent, itself) {
    // Iterate over all winnable routes to update the current progress of player on each route
    for (let i in winRoutes) {
        let route = winRoutes[i];
        winRouteProgress[i] = 0;

        for (let r in route) {
            let c = route[r];

            if (grid[c[0]][c[1]] === opponent) {
                winRouteProgress[i]++;
            }

            if (grid[c[0]][c[1]] === itself) {
                winRouteProgress[i]--;
            }
        }
    }

    // Return the first route where 2 cells are filled by player and one is empty
    for (let p in winRouteProgress) {
        if (winRouteProgress[p] == (GRID_LENGTH - 1)) {
            return winRoutes[p];
        }
    }

    return false;
}

/**
 * This function increments the number of turns
 */
function incrementTurns() {
    numberOfTurns++;

    // First check if someone won the game
    checkIfSomeoneWon();

    if (gameState == 2) {
        return false;
    }

    // Next check if all the cells are filled up with no conclusion
    if (numberOfTurns == GRID_LENGTH * GRID_LENGTH) {
        gameOver(false);
    }
}

/**
 * This function checks if someone has won the game
 */
function checkIfSomeoneWon() {
    // Iterate over all winnable routes
    for (let i in winRoutes) {
        let route = winRoutes[i];

        // Join all the nodes in this route to form a string
        let currentStateOfRoute = "";
        for (let r in route) {
            let c = route[r];
            currentStateOfRoute = currentStateOfRoute + "" + grid[c[0]][c[1]];
        }

        // Iterate over the players' win sequence
        for (let player in winSequenceOfPlayers) {
            // If the win sequence matches with any of the routes,
            // this player has won the game
            if (currentStateOfRoute == winSequenceOfPlayers[player]) {
                gameOver(true, player);
                return;
            }
        }
    }
}

/**
 * This function is called when the game is started by the user
 */
function gameStarted() {
    if (gameState === 0) {
        gameState = 1;
    }
}

/**
 * This function is called when the game is finished
 * either by winning or playing out a draw
 */
function gameOver(gameWon, player) {
    gameState = 2;
    removeClickHandlers();

    if (gameWon) {
        paintWinner(player);
    } else {
        paintDraw();
    }
}

/**
 * Once the game ends, remove click handlers.
 */
function removeClickHandlers() {
    var boxes = document.getElementsByClassName("box");
    for (var idx = 0; idx < boxes.length; idx++) {
        boxes[idx].removeEventListener('click', onBoxClick, false);
    }
}

/**
 * This function displays the winner
 */
function paintWinner(player) {
    setTimeout(function() {
        document.getElementById("player").innerHTML = player;
        document.getElementById("winner").className += " show";
    }, 300);
}

/**
 * This function displays draw
 */
function paintDraw() {
    setTimeout(function() {
        document.getElementById("draw").className += " show";
    }, 300);
}

initializeGrid();
renderMainGrid();
addClickHandlers();
