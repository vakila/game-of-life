// Set up with default values
var nColumns = 20;
var nRows = 20;
document.getElementById("num-cols").value = nColumns;
document.getElementById("num-rows").value = nRows;
resizeGrid(nColumns, nRows);

// Clear and re-create the grid whenever the user clicks "Resize grid"
function resizeGrid(cols, rows) {
    nColumns = cols;
    nRows = rows;
    console.log("C: " + String(nColumns));
    console.log("R: " + String(nRows));

    var grid = document.getElementById("grid");

    var cellWidth = 1 / cols * 100;
    console.log("cellWidth: " + String(cellWidth));

    var cellHeight = 1 / rows * 100;
    console.log("cellHeight: " + String(cellHeight));

    // Clear grid completely
    while (grid.lastChild) {
      grid.removeChild(grid.lastChild);
    }

    // Insert row divs
    for (var r = 0; r < rows; r++) {
        var thisRow = document.createElement("div");
        thisRow.className = "grid-row";
        thisRow.style.height = String(cellHeight) + "%";
        grid.appendChild(thisRow);

        // Insert cell divs
        for (var c = 0; c < cols; c++) {
            var thisCell = document.createElement("div");
            thisCell.classList.add("cell");
            thisCell.id = "r" + String(r) + "-c" + String(c)
            thisCell.style.width = String(cellWidth) + "%";
            thisCell.style.height = "100%";
            thisCell.onclick = function() { this.classList.toggle("alive"); };
            //thisCell.onclick = function() { getNewStatus(this.id); };
            thisRow.appendChild(thisCell);



        }

    }

    // Randomly initiate grid
    randomValues();
}


// Global variables for tracking continuous evolution
var isRunning = false; //tracks whether the thing is running
var interval; //holds the interval which will need to be cleared

// Stop continuous evolution
function stopEvolving() {
    console.log("Ending evolution.");
    clearInterval(interval);
    var button = document.getElementById("startButton");
    isRunning = false;
    button.value = "stopped";
    button.innerHTML = "Start evolving";
    document.getElementById("speed").disabled = false;
}

// Start or stop continuous evolution depending on current state
function toggleEvolve(button) {
    console.log(button.value);

    if (button.value === "stopped") {
        isRunning = true;
        button.value = "running";
        button.innerHTML = "Stop evolving";
        var slider = document.getElementById("speed");
        var speed = slider.value;
        console.log("Beginning evolution... (", speed, "ms)");
        slider.disabled = true;
        interval = setInterval(function() { updateGrid(); }, speed);
    } else {
        stopEvolving();
    }

}


// Evolve the grid once
function updateGrid() {
    console.log("Updating grid");
    var allCells = document.getElementsByClassName("cell");
    var newStatuses = {}
    for (var i = 0; i < allCells.length; i++) {
        //iterate once to get the new statuses
        var thisId = allCells[i].id;
        newStatuses[thisId] = getNewStatus(thisId);
    }
    for (var i = 0; i < allCells.length; i++) {
        //iterate again to set new statuses
        var thisCell = allCells[i];
        var willLive = newStatuses[thisCell.id];
        thisCell.classList.toggle("alive", willLive); //adds if willLive == true, removes if false
    }

}

// Function to compute the next status of a particular cell based on neighbors
function getNewStatus(cellId) {
    var pals = countAliveNeighbors(cellId);
    var cell = getCell(cellId);
    var isAlive = cell.classList.contains("alive");

    if (isAlive) { //cell is alive
        if (pals < 2 || pals > 3) { // too few || too many
            //console.log("Cell " + cellId + " dies")
            isAlive = false; //cell dies
        } else {
            //console.log("Cell " + cellId + " stays alive")
        }
    } else { //cell is dead
        if (pals === 3) {
            //console.log("Cell " + cellId + " is born")
            isAlive = true; //cell is born
        } else {
            //console.log("Cell " + cellId + " stays dead")
        }
    }

    return isAlive;
}



// Count the number of living neighboring cells, for a given cell
function countAliveNeighbors(cellId) {
    var neighborList = findNeighbors(cellId);
    var liveOnes = 0;
    neighborList.forEach( function(cellId) {
        var neighbor = getCell(cellId);
        if (neighbor === null) {
            console.Log("ERROR Can't find cell " + cellId);
            return;
        }
        if (neighbor.classList.contains("alive")) {
            liveOnes += 1;
        }
    });
    //console.log("liveOnes: ", liveOnes);
    return liveOnes;
}

// Find the cell IDs of all neighbors of a given cell
function findNeighbors(cellId) {
    var coords = parseCellId(cellId);
    //console.log("coords", coords);

    var deltaList = [   [-1,-1],[-1,0], [-1,1],
				        [0,-1],         [0,1],
				        [1,-1], [1,0],  [1,1]
                    ];

    var neighborList = []; //list of IDs

    deltaList.forEach( function(dels) {
        // newR = oldR + delR
        var newR = coords[0] + dels[0];
        var newC = coords[1] + dels[1];
        if (newR < 0 || newC < 0 || newR >= nRows || newC >= nColumns) {
            //calculated cell is off the grid (doesn't exist)
            //console.log("Cell doesn't exist: ", getCellId([newR, newC]));
        } else {
            var newId = getCellId([newR, newC]);
            neighborList.push(newId);
        }
    });

    //console.log(neighborList);
    return neighborList;
}

// Get the row and column numbers from the cell ID string (e.g. "r2-c4")
function parseCellId(cellId) {
    var splitted = cellId.split("-");
    //console.log(splitted);
    var thisR = parseInt(splitted[0].slice(1));
    var thisC = parseInt(splitted[1].slice(1));
    //console.log("thisR: ", thisR, " thisC: ", thisC);
    return [thisR, thisC];
}

// Output the cell ID string for a given row and column number
function getCellId(coordList) {
    return "r" + String(coordList[0]) + "-c" + String(coordList[1]);
}

// Return the <div> element with the given ID
function getCell(cellId) {
    return document.getElementById(cellId);
}

// Set all cells to dead
function clearGrid() {
    stopEvolving();
    var allCells = document.getElementsByClassName("cell");
    for (var i = 0; i < allCells.length; i++) {
        allCells[i].classList.remove("alive");
    }
}

// Set all cells to alive
function fillGrid() {
    stopEvolving();
    var allCells = document.getElementsByClassName("cell");
    for (var i = 0; i < allCells.length; i++) {
        allCells[i].classList.add("alive");
    }
}

// Set alternating alive-dead-alive pattern
function checkerGrid() {
    stopEvolving();
    var allCells = document.getElementsByClassName("cell");
    for (var i = 0; i < allCells.length; i++) {
        var thisCell = allCells[i];
        var coords = parseCellId(thisCell.id);
        var r = coords[0], c = coords[1];
        if (r % 2 === 0 && c % 2 === 0 || r % 2 === 1 && c %2 === 1) {
            thisCell.classList.add("alive");
        } else {
            thisCell.classList.remove("alive");
        }
    }
}

// Set cells to dead/alive at random
function randomValues() {
    stopEvolving();
    var allCells = document.getElementsByClassName("cell");
    for (var i = 0; i < allCells.length; i++) {
        var randomBool = Math.random() >= 0.5;
        allCells[i].classList.toggle("alive", randomBool);
    }
}
