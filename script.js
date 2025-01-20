const ROWS = 10;
const COLS = 10;
let start = null;
let destination = null;
let blocks = new Set();
let currentMode = null;

// Create the grid
const gridContainer = document.getElementById("grid-container");

const gridCells = {};
for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener("click", () => handleClick(i, j));
        gridContainer.appendChild(cell);
        gridCells[`${i},${j}`] = cell;
    }
}

// Handle cell clicks
function handleClick(row, col) {
    const cell = gridCells[`${row},${col}`];

    if (currentMode === "select") {
        if (`${row},${col}` !== start && `${row},${col}` !== destination) {
            cell.classList.add("block");
            blocks.add(`${row},${col}`);
        }
    } else if (currentMode === "delete") {
        cell.classList.remove("block", "start", "final", "path");
        blocks.delete(`${row},${col}`);
        if (`${row},${col}` === start) start = null;
        if (`${row},${col}` === destination) destination = null;
    } else if (currentMode === "start") {
        if (start) gridCells[start].classList.remove("start");
        cell.classList.add("start");
        start = `${row},${col}`;
    } else if (currentMode === "final") {
        if (destination) gridCells[destination].classList.remove("final");
        cell.classList.add("final");
        destination = `${row},${col}`;
    }
}

// Reset grid
// Reset grid
function resetGrid() {
    start = null;
    destination = null;
    blocks.clear();
    Object.values(gridCells).forEach(cell => {
        cell.classList.remove("block", "start", "final", "path");
        cell.textContent = ""; // Clear numbers from cells
    });
    document.getElementById("status").textContent = "Grid reset. Select Start and Destination points.";
}

// Set mode
function setMode(mode) {
    currentMode = mode;
    document.getElementById("status").textContent = `Mode: ${mode}`;
}

// Pathfinding (BFS)
async function findPath() {
    if (!start || !destination) {
        document.getElementById("status").textContent = "Please set both Start and Destination points!";
        return;
    }

    let queue = [[start, []]];
    let visited = new Set();

    while (queue.length > 0) {
        let [current, path] = queue.shift();
        if (visited.has(current)) continue;

        visited.add(current);
        let [row, col] = current.split(",").map(Number);
        let currentPath = [...path, current];

        if (current !== start && current !== destination) {
            gridCells[current].textContent = path.length;
        }

        if (current === destination) {
            await animatePath(currentPath);
            return;
        }

        for (let [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
            let nr = row + dr, nc = col + dc;
            let nextCell = `${nr},${nc}`;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(nextCell) && !blocks.has(nextCell)) {
                queue.push([nextCell, currentPath]);
            }
        }
    }

    document.getElementById("status").textContent = "No path found!";
}

// Animate path
async function animatePath(path) {
    for (let cell of path) {
        if (cell !== start && cell !== destination) {
            gridCells[cell].classList.add("path");
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    document.getElementById("status").textContent = "Path animation complete!";
}
