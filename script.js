class MicromouseMaze {
    constructor() {
        this.grid = document.getElementById('grid');
        this.currentMode = 'select';
        this.startCell = null;
        this.endCell = null;
        this.cells = [];
        this.initializeGrid();
        this.setupEventListeners();
    }

    initializeGrid() {
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            this.cells.push(cell);
            this.grid.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.getElementById('selectBtn').addEventListener('click', () => this.currentMode = 'select');
        document.getElementById('deleteBtn').addEventListener('click', () => this.currentMode = 'delete');
        document.getElementById('startBtn').addEventListener('click', () => this.currentMode = 'start');
        document.getElementById('finalBtn').addEventListener('click', () => this.currentMode = 'final');
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGrid());
        document.getElementById('findPathBtn').addEventListener('click', () => this.findPath());

        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
    }

    handleCellClick(cell) {
        switch (this.currentMode) {
            case 'select':
                if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
                    cell.classList.toggle('obstacle');
                }
                break;
            case 'delete':
                cell.className = 'cell';
                if (cell === this.startCell) this.startCell = null;
                if (cell === this.endCell) this.endCell = null;
                cell.textContent = '';
                break;
            case 'start':
                if (this.startCell) this.startCell.className = 'cell';
                if (!cell.classList.contains('end')) {
                    cell.className = 'cell start';
                    this.startCell = cell;
                }
                break;
            case 'final':
                if (this.endCell) this.endCell.className = 'cell';
                if (!cell.classList.contains('start')) {
                    cell.className = 'cell end';
                    this.endCell = cell;
                }
                break;
        }
    }

    resetGrid() {
        this.cells.forEach(cell => {
            cell.className = 'cell';
            cell.textContent = '';
        });
        this.startCell = null;
        this.endCell = null;
    }

    async findPath() {
        if (!this.startCell || !this.endCell) {
            alert('Please set both start and end points');
            return;
        }

        // Reset previous path
        this.cells.forEach(cell => {
            if (cell.classList.contains('path') || cell.classList.contains('visited')) {
                cell.className = 'cell';
                if (cell.classList.contains('obstacle')) cell.classList.add('obstacle');
            }
            cell.textContent = '';
        });

        const startIndex = parseInt(this.startCell.dataset.index);
        const queue = [[startIndex]];
        const visited = new Set([startIndex]);
        const distances = new Array(100).fill(Infinity);
        const algorithmSteps = new Array(100).fill(0);
        let stepCount = 1;
        distances[startIndex] = 0;

        while (queue.length > 0) {
            const currentPath = queue.shift();
            const currentIndex = currentPath[currentPath.length - 1];

            if (currentIndex === parseInt(this.endCell.dataset.index)) {
                await this.animatePath(currentPath, distances, algorithmSteps);
                return;
            }

            const neighbors = this.getNeighbors(currentIndex);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor) && !this.cells[neighbor].classList.contains('obstacle')) {
                    visited.add(neighbor);
                    distances[neighbor] = distances[currentIndex] + 1;
                    algorithmSteps[neighbor] = stepCount++;
                    queue.push([...currentPath, neighbor]);
                    if (this.cells[neighbor] !== this.endCell) {
                        this.cells[neighbor].classList.add('visited');
                        this.cells[neighbor].textContent = algorithmSteps[neighbor];
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
            }
        }

        alert('No path found!');
    }

    async animatePath(path, distances, algorithmSteps) {
        for (let i = 1; i < path.length - 1; i++) {
            const cell = this.cells[path[i]];
            cell.classList.remove('visited');
            cell.classList.add('path');
            cell.textContent = distances[path[i]];
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / 10);
        const col = index % 10;

        if (row > 0) neighbors.push(index - 10);  // up
        if (row < 9) neighbors.push(index + 10);  // down
        if (col > 0) neighbors.push(index - 1);   // left
        if (col < 9) neighbors.push(index + 1);   // right

        return neighbors;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MicromouseMaze();
});