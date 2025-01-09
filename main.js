const canvas = document.getElementById('bitFactory');
const ctx = canvas.getContext('2d', { alpha: false });

const target = new Target(ctx);
let extractors = [];

const gridSize = 1024;
const cellSize = 10;
let scale = 2;
let drawMode = DrawModeType.NONE;

const backgroundColors = ['#205987', '#215B8A', '#225C8C', '#225E8F'];

let isDragging = false;
let isDrawingConveyor = false;
let startX, startY;
let offsetX = canvas.width / 2, offsetY = canvas.height / 2;
let hoverX = -1, hoverY = -1;
let conveyorStartX = -1, conveyorStartY = -1;
let conveyerDrawStartDirection = DrawStartDirectionType.HORIZONTAL;

const beltGraph = new Map();

class Cell {
    constructor(backgroundColor) {
        this.BackgroundColor = backgroundColor;
        this.HasExtractor = false;
        this.Number = 0;
        this.Type = CellType.EMPTY;
        this.Component = null;
        this.beltNode = null;
    }
}

const matrix = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => new Cell(
    backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
)));

function getValidPosition() {
    let x = 0;
    let y = 0;
    let notValid = true;
    while (notValid) {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
        var distCenter = Math.sqrt((x - 512) * (x - 512) + (y - 512) * (y - 512));
        if (distCenter > 20) {
            notValid = false;
            for (let i = -10; i <= 10; i++) {
                for (let j = -10; j <= 10; j++) {
                    if (x + i >= 0 && x + i < gridSize && y + j >= 0 && y + j < gridSize) {
                        if (matrix[x + i][y + j].Type === CellType.NUMBER) {
                            notValid = true;
                            break;
                        }
                    }
                }
                if (notValid) break;
            }
        }
    }
    return { x: x, y: y };
}

// mark 6x6 center as the target
for (let x = 509; x <= 514; x++) {
    for (let y = 509; y <= 514; y++) {
        var cell = matrix[x][y];
        cell.Type = CellType.TARGET;
    }
}

function enableNumber(x, y) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < gridSize && y + j >= 0 && y + j < gridSize) {
                var cell = matrix[x + i][y + j];
                cell.BackgroundColor = "#1C4F77";
                cell.Number = number;
                if (i == 0 && j == 0) {
                    cell.Type = CellType.NUMBER;
                } else {
                    cell.Type = CellType.NUMBERBUFFER;
                }
            }
        }
    }
}

// Insert 1024 random numbers between 1 and 9
for (let i = 0; i < 1024; i++) {
    var pos = getValidPosition();
    var number = Math.floor(Math.random() * 9) + 1;
    if (number <= target.Level) {
        enableNumber(pos.x, pos.y);
    } else
    {
        var cell = matrix[pos.x][pos.y];
        cell.Number = number;
        cell.Type = CellType.NUMBER;
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2870A5';
    ctx.lineWidth = 1;
    ctx.fillStyle='#000000';
    ctx.font = `${cellSize * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const scaledCellSize = cellSize * scale;

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const drawX = x * scaledCellSize + offsetX;
            const drawY = y * scaledCellSize + offsetY;
            if (drawX + scaledCellSize > 0 && drawX < canvas.width && drawY + scaledCellSize > 0 && drawY < canvas.height) {
                var cell = matrix[x][y];
                ctx.fillStyle = cell.BackgroundColor;
                ctx.fillRect(drawX, drawY, scaledCellSize, scaledCellSize);
                if (cell.Type == CellType.NUMBER) {
                    if (cell.Number <= target.Level)
                    {
                    ctx.fillStyle = '#cccccc';
                    } else {
                        ctx.fillStyle = '#9999ff';
                    }
                    ctx.fillText(cell.Number, drawX + scaledCellSize / 2, drawY + scaledCellSize / 2 + scale);
                }
            }
        }
    }

    if (scale >= 2) {
        ctx.beginPath();
        for (let x = 0; x <= gridSize; x++) {
            const drawX = x * scaledCellSize + offsetX;
            if (drawX >= 0 && drawX <= canvas.width) {
                ctx.moveTo(drawX, 0);
                ctx.lineTo(drawX, canvas.height);
            }
        }
        for (let y = 0; y <= gridSize; y++) {
            const drawY = y * scaledCellSize + offsetY;
            if (drawY >= 0 && drawY <= canvas.height) {
                ctx.moveTo(0, drawY);
                ctx.lineTo(canvas.width, drawY);
            }
        }
        ctx.stroke();
    }

    if (isDrawingConveyor && conveyorStartX >= 0 && conveyorStartY >= 0) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8 * scale;
        ctx.beginPath();
        ctx.moveTo(conveyorStartX * scaledCellSize + offsetX + scaledCellSize / 2, conveyorStartY * scaledCellSize + offsetY + scaledCellSize / 2);
        if (conveyerDrawStartDirection === DrawStartDirectionType.HORIZONTAL) {
            ctx.lineTo(hoverX * scaledCellSize + offsetX + scaledCellSize / 2, conveyorStartY * scaledCellSize + offsetY + scaledCellSize / 2);
            ctx.lineTo(hoverX * scaledCellSize + offsetX + scaledCellSize / 2, hoverY * scaledCellSize + offsetY + scaledCellSize / 2);
        } else {
            ctx.lineTo(conveyorStartX * scaledCellSize + offsetX + scaledCellSize / 2, hoverY * scaledCellSize + offsetY + scaledCellSize / 2);
            ctx.lineTo(hoverX * scaledCellSize + offsetX + scaledCellSize / 2, hoverY * scaledCellSize + offsetY + scaledCellSize / 2);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    // Draw the target in the center of the grid
    const centerX = (gridSize / 2) * scaledCellSize + offsetX;
    const centerY = (gridSize / 2) * scaledCellSize + offsetY;
    target.draw(centerX, centerY, scaledCellSize);

    // Draw extractors
    for (let i = 0; i < extractors.length; i++) {
        const extractor = extractors[i];
        const posX = extractor.tileX * scaledCellSize + offsetX + scaledCellSize * 0.5;
        const posY = extractor.tileY * scaledCellSize + offsetY + scaledCellSize * 0.5;
        extractor.draw(posX, posY, scaledCellSize);
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
}

function handleScroll(event) {
    event.preventDefault();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const canvasRect = canvas.getBoundingClientRect();
    const offsetXBeforeZoom = (mouseX - canvasRect.left) / scale - offsetX / scale;
    const offsetYBeforeZoom = (mouseY - canvasRect.top) / scale - offsetY / scale;

    if (event.deltaY < 0) {
        scale *= 1.1;
    } else {
        scale *= 0.9;
    }
    scale = Math.max(1, Math.min(5, scale));

    const offsetXAfterZoom = (mouseX - canvasRect.left) / scale - offsetX / scale;
    const offsetYAfterZoom = (mouseY - canvasRect.top) / scale - offsetY / scale;

    offsetX += (offsetXAfterZoom - offsetXBeforeZoom) * scale;
    offsetY += (offsetYAfterZoom - offsetYBeforeZoom) * scale;

    // Ensure the user cannot pan or zoom outside the grid
    const maxOffsetX = canvas.width - gridSize * cellSize * scale;
    const maxOffsetY = canvas.height - gridSize * cellSize * scale;
    offsetX = Math.min(0, Math.max(maxOffsetX, offsetX));
    offsetY = Math.min(0, Math.max(maxOffsetY, offsetY));

    drawGrid();
}

function setCellComponent(x, y, component) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            var cell = matrix[x + i][y + j];
            cell.Component = component;
            if (component instanceof Extractor) {
                cell.HasExtractor = true;
            }
        }
    }
}

function handleMouseDown(event) {
    if (event.button === 2) { // Right mouse button
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
    } else if (event.button === 0) { // Left mouse button
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Get the cell coordinates
        const canvasRect = canvas.getBoundingClientRect();
        const x = Math.floor((mouseX - canvasRect.left - offsetX) / (cellSize * scale));
        const y = Math.floor((mouseY - canvasRect.top - offsetY) / (cellSize * scale));
        const cell = matrix[x][y];

        // Check if starting to draw a conveyor
        if (x >= 0 
            && x < gridSize 
            && y >= 0 
            && y < gridSize 
            && (cell.HasExtractor || cell.Type === CellType.CONVEYER)) {
            isDrawingConveyor = true;
            conveyorStartX = x;
            conveyorStartY = y;
        }

        // Check if placing an extractor
        if (drawMode === DrawModeType.EXTRACTOR) {
            if (cell && cell.Type === CellType.NUMBER && target.Level >= cell.Number) {
                if (hoverX >= 0 && hoverY >= 0) {
                    let extractor = new Extractor(ctx, cell.Number, hoverX, hoverY);
                    extractors.push(extractor);
                    setCellComponent(hoverX, hoverY, extractor);
                    drawGrid();
                }
            }
        }
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        const dx = (event.clientX - startX);
        const dy = (event.clientY - startY);
        offsetX += dx;
        offsetY += dy;
        startX = event.clientX;
        startY = event.clientY;

        // Ensure the user cannot pan outside the grid
        const maxOffsetX = canvas.width - gridSize * cellSize * scale;
        const maxOffsetY = canvas.height - gridSize * cellSize * scale;
        if (offsetX > 0)
        {
            offsetX = 0;
        }
        if (offsetY > 0)
        {
            offsetY = 0;
        }
        if (offsetX < maxOffsetX) {
            offsetX = maxOffsetX;
        }
        if (offsetY < maxOffsetY) {
            offsetY = maxOffsetY;
        }

        drawGrid();
    } else {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Get the cell coordinates
        const canvasRect = canvas.getBoundingClientRect();
        const x = Math.floor((mouseX - canvasRect.left - offsetX) / (cellSize * scale));
        const y = Math.floor((mouseY - canvasRect.top - offsetY) / (cellSize * scale));

        // Update hover cell
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
            hoverX = x;
            hoverY = y;
        } else {
            hoverX = -1;
            hoverY = -1;
        }

        drawGrid();

        const scaledCellSize = cellSize * scale;

        if (drawMode === DrawModeType.CONVEYER) {
            if ((hoverX-1==conveyorStartX && hoverY==conveyorStartY) || (hoverX+1==conveyorStartX && hoverY==conveyorStartY)) {
                conveyerDrawStartDirection = DrawStartDirectionType.HORIZONTAL;
                console.log("Horizontal");
            } else if ((hoverX==conveyorStartX && hoverY-1==conveyorStartY) || (hoverX==conveyorStartX && hoverY+1==conveyorStartY)) {
                conveyerDrawStartDirection = DrawStartDirectionType.VERTICAL;
                console.log("Vertical");
            }
            if (hoverX >= 0 && hoverY >= 0 && hoverX < gridSize && hoverY < gridSize) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
                const drawX = hoverX * scaledCellSize + offsetX;
                const drawY = hoverY * scaledCellSize + offsetY;
                ctx.fillRect(drawX, drawY, scaledCellSize, scaledCellSize);
            }
        } else if (drawMode === DrawModeType.EXTRACTOR) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
            const drawX = (hoverX - 1) * scaledCellSize + offsetX;
            const drawY = (hoverY - 1) * scaledCellSize + offsetY;
            ctx.fillRect(drawX, drawY, scaledCellSize * 3, scaledCellSize * 3);
        }
    }
}

function getConveyerLineCellPoints(x, y) {
    x = Math.max(0, Math.min(gridSize - 1, x));
    y = Math.max(0, Math.min(gridSize - 1, y));

    let dx = 0;
    let dy = 0;
    // convert x into -1 or +1 for horizontal direction
    if (x < conveyorStartX) {
        dx = -1;
    } else if (x > conveyorStartX) {
        dx = 1;
    }

    // convert y into -1 or +1 for vertical direction
    if (y < conveyorStartY) {
        dy = -1;
    } else if (y > conveyorStartY) {
        dy = 1;
    }

    let cellPoints = [];
    let inEmptycell = false;

    if (conveyerDrawStartDirection === DrawStartDirectionType.HORIZONTAL) {
        const endX = x;
        const stepX = conveyorStartX < x ? 1 : -1;
        for (let i = conveyorStartX; i !== endX + stepX; i += stepX) {
            var cell = matrix[i][conveyorStartY];
            if (cell.Type === CellType.EMPTY) {
                inEmptycell = true;
                if (cellPoints.length === 1) {
                    cellPoints.push({ x: i, y: conveyorStartY });
                }
            } else if (cell.Type != CellType.EMPTY && inEmptycell) {
                cellPoints.push({ x: i + stepX, y: conveyorStartY });
                return cellPoints;
            }
        }
        cellPoints.push({ x: endX, y: conveyorStartY });

        const endY = y;
        const stepY = conveyorStartY < y ? 1 : -1;
        for (let j = conveyorStartY + stepY; j !== endY + stepY; j += stepY) {
            cell = matrix[endX][j];
            if (cell.Type === CellType.EMPTY) {
                inEmptycell = true;
                if (cellPoints.length === 0) {
                    cellPoints.push({ x: endX, y: j });
                }
            } else if (cell.Type != CellType.EMPTY && inEmptycell) {
                cellPoints.push({ x: endX, y: j + stepY });
                return cellPoints;
            }
        }
        cellPoints.push({ x: endX, y: endY });
    } else {
        const endY = y;
        const stepY = conveyorStartY < y ? 1 : -1;
        for (let j = conveyorStartY; j !== endY + stepY; j += stepY) {
            var cell = matrix[conveyorStartX][j];
            if (cell.Type === CellType.EMPTY) {
                inEmptycell = true;
                if (cellPoints.length === 0) {
                    cellPoints.push({ x: conveyorStartX, y: j });
                }
            } else if (cell.Type != CellType.EMPTY && inEmptycell) {
                cellPoints.push({ x: conveyorStartX, y: j + stepY });
                return cellPoints;
            }
        }
        cellPoints.push({ x: conveyorStartX, y: endY });

        const endX = x;
        const stepX = conveyorStartX < x ? 1 : -1;
        for (let i = conveyorStartX + stepX; i !== endX + stepX; i += stepX) {
            cell = matrix[i][endY];
            if (cell.Type === CellType.EMPTY) {
                inEmptycell = true;
                if (cellPoints.length === 0) {
                    cellPoints.push({ x: i, y: endY });
                }
            } else if (cell.Type != CellType.EMPTY && inEmptycell) {
                cellPoints.push({ x: i + stepX, y: endY });
                return cellPoints;
            }
        }
        cellPoints.push({ x: endX, y: endY });
    }

    return cellPoints;
}

function drawHorizontalConveyerLine(start, end) {
    let i = start.x;
    const step = (end.x > start.x) ? 1 : -1;
    while (i !== end.x) {
        var cell = matrix[i][start.y];
        cell.BackgroundColor = 'black';
        cell.Type = CellType.CONVEYER;
        i += step;
    }
    cell = matrix[end.x][start.y];
    cell.BackgroundColor = 'black';
    cell.Type = CellType.CONVEYER;
}

function drawVerticalConveyerLine(start, end) {
    let j = start.y;
    const step = (end.y > start.y) ? 1 : -1;
    while (j !== end.y) {
        var cell = matrix[start.x][j];
        cell.BackgroundColor = 'black';
        cell.Type = CellType.CONVEYER;
        j += step;
    }
    cell = matrix[start.x][end.y];
    cell.BackgroundColor = 'black';
    cell.Type = CellType.CONVEYER;
}

function convertToConveyer(mouseX, mouseY) {
    const canvasRect = canvas.getBoundingClientRect();
    const x = Math.floor((mouseX - canvasRect.left - offsetX) / (cellSize * scale));
    const y = Math.floor((mouseY - canvasRect.top - offsetY) / (cellSize * scale));

    let points = getConveyerLineCellPoints(x, y);

    if (points.length === 3) {
        if (conveyerDrawStartDirection === DrawStartDirectionType.HORIZONTAL) {
            drawHorizontalConveyerLine(points[0], points[1]);
            drawVerticalConveyerLine(points[1], points[2]);
        } else {
            drawVerticalConveyerLine(points[0], points[1]);
            drawHorizontalConveyerLine(points[1], points[2]);
        }
    } else if (points.length === 2) {
        if (points[0].x === points[1].x) {
            drawVerticalConveyerLine(points[0], points[1]);
        } else {
            drawHorizontalConveyerLine(points[0], points[1]);
        }
    }
}

function handleMouseUp(event) {
    if (event.button === 2) { // Right mouse button
        isDragging = false;
    } else if (event.button === 0 && isDrawingConveyor) { // Left mouse button
        isDrawingConveyor = false;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        convertToConveyer(mouseX, mouseY);
        drawGrid();
    }
}

function enableButton(buttonId, clickHandler) {
    const button = document.getElementById(buttonId);
    button.classList.add('enabled');
    button.addEventListener('click', () => {
        document.querySelectorAll('.button').forEach(btn => btn.classList.remove('toggled'));
        button.classList.add('toggled');
        clickHandler();
    });
}

function initializeButtons() {
    enableButton('beltButton', () => {
        drawMode = DrawModeType.CONVEYER;
    });
    enableButton('extractorButton', () => {
        drawMode = DrawModeType.EXTRACTOR;
    });
    enableButton('demolishButton', () => {
        drawMode = DrawModeType.DEMOLISHER;
    });
}

document.addEventListener('DOMContentLoaded', initializeButtons);

window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('wheel', handleScroll);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('contextmenu', event => event.preventDefault()); // Prevent context menu on right click

resizeCanvas();
offsetX = canvas.width / 2 - (gridSize * cellSize * scale) / 2;
offsetY = canvas.height / 2 - (gridSize * cellSize * scale) / 2;
drawGrid();
