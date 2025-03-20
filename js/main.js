/*
* Number Factory - A number and math factory game 
* Copyright (C) 2025  Hans Milling
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//todo list:
// Implement demolish functionality (draw rectangle to erase everything within)
// Fix items moving to end of belt when there is no room in junction. It also looks like one item too many is added in the first place to the next belt segment, so the last item in the next belt segment is drawn on top of the junction.
// Fix demolishing where "empty" junctions can stay forever. Perhps register junction input belts as well to be able to know when junction has no more belts in and out and can be removed.
// If placing a component on top of a belt start or end, the belt and component should be connected.
// Prevent making a back loop (how can we detect that?)
// Fix drawing belt inside/along exissting belt, cancel the belt if more than 1 cell is drawn on top of another belt not counting the end
// Implement upgrades like faster belts, extractors etc
// Implement level ups with new components from level 4 and forward
// - Level 4: bridge
// - Level 7: multiplier
// - Level 10: belt priorities
// - Level 13: subtractor
// - Level 16: divider
// - Level 19: exponentiator
// - Level 22: storage
// - Level 26: subtractor
// - Level 29: subtractor

// Implement a way to save and load the game in local storage, perhpas using random seend for the numbers and saving random seed, belt graph+components and levels+ statistics from trget.


const canvasGrid = document.getElementById('canvasGrid');
const ctxGrid = canvasGrid.getContext('2d', { alpha: false });

const canvasConveyers = document.getElementById('canvasConveyers');
const ctxConveyers = canvasConveyers.getContext('2d', { alpha: true });

const canvasComponents = document.getElementById('canvasComponents');
const ctxComponents = canvasComponents.getContext('2d', { alpha: true });

var componentRotation = ComponentRotation.RIGHT;
var hoverOver = null;
let conveyerAnimationStep = 0;
let statisticsTimer = null;
const target = new Target(ctxComponents, (unlocks) => {
    if (unlocks) {
        console.log(`Unlocked: ${unlocks}`);
        // switch on unlocks, if unlock is "adder", show the adder button
        switch (unlocks) {
            case "Adder":
                enableButton('adderButton', () => {
                    drawMode = DrawModeType.ADDER;
                });
                const adderButton = document.getElementById('adderButton');
                Array.from(adderButton.children).forEach(child => child.classList.add('flashing'));
                setTimeout(() => {
                    Array.from(adderButton.children).forEach(child => child.classList.remove('flashing'));
                }, 2000);
                break;
        }
    }
}, drawComponents);

let components = [];

let scale = 2;
let drawMode = DrawModeType.NONE;
let scaledCellSize = cellSize * scale;

const backgroundColors = ['#205987', '#215B8A', '#225C8C', '#225E8F'];

let isDragging = false;
let isDrawingConveyor = false;
let startX, startY;
let offsetX = canvasGrid.width / 2, offsetY = canvasGrid.height / 2;
let hoverX = -1, hoverY = -1;
let conveyorStartX = -1, conveyorStartY = -1;
let conveyerDrawStartDirection = DirectionType.HORIZONTAL;

const beltGraph = new BeltGraph();

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
        let distCenter = Math.sqrt((x - 512) * (x - 512) + (y - 512) * (y - 512));
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
        let cell = matrix[x][y];
        cell.Type = CellType.TARGET;
        cell.Component = target;
    }
}

function enableNumber(x, y, number) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < gridSize && y + j >= 0 && y + j < gridSize) {
                let cell = matrix[x + i][y + j];
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
    let pos = getValidPosition();
    let number = Math.floor(Math.random() * 9) + 1;
    if (number == 1) {
        enableNumber(pos.x, pos.y, 1);
    } else
    {
        let cell = matrix[pos.x][pos.y];
        cell.Number = number;
        cell.Type = CellType.NUMBER;
    }
}
  

// Initial test data
function initializeTestData() {
//  enable to create test data
   
    enableNumber(520, 500, 1);
    let extractor = new Extractor(ctxComponents, 1, 520, 500);
    components.push(extractor);
    setCellComponent(520, 500, extractor);
    let adder = new Adder(ctxComponents, 511, 500, componentRotation);
    components.push(adder);
    setCellComponent(511, 500, adder);
    drawMode = DrawModeType.CONVEYER;
/*
    let points = [{ x: 519, y: 499, }, { x: 511, y: 499, }, { x: 511, y: 509 }];
    createConveyer(points);
    let points2 = [{ x: 511, y: 500}, {x:512, y: 500}, {x: 512, y: 509}];
    createConveyer(points2);
    let points3 = [{ x: 512, y: 501}, {x:513, y: 501}, {x: 513, y: 509}];
    createConveyer(points3);
    let points4 = [{ x: 516, y: 499}, {x:516, y: 504}, {x: 513, y: 504}];
    createConveyer(points4);
    */

    let points5 = [{ x: 519, y: 500}, {x:512, y: 500}];
    createConveyer(points5);
    let points6 = [{ x: 515, y: 500}, { x: 515, y: 501}, {x:512, y: 501}];
    createConveyer(points6);
}

initializeTestData();

function drawSuggestedConveyer()
{
    ctxConveyers.strokeStyle = '#00ff0044';
    ctxConveyers.lineWidth = 8 * scale;
    ctxConveyers.beginPath();
    ctxConveyers.moveTo(conveyorStartX * scaledCellSize + offsetX + scaledCellSize / 2, conveyorStartY * scaledCellSize + offsetY + scaledCellSize / 2);
    if (conveyerDrawStartDirection === DirectionType.HORIZONTAL) {
        ctxConveyers.lineTo(hoverX * scaledCellSize + offsetX + scaledCellSize / 2, conveyorStartY * scaledCellSize + offsetY + scaledCellSize / 2);
        ctxConveyers.lineTo(hoverX * scaledCellSize + offsetX + scaledCellSize / 2, hoverY * scaledCellSize + offsetY + scaledCellSize / 2);
    } else {
        ctxConveyers.lineTo(conveyorStartX * scaledCellSize + offsetX + scaledCellSize / 2, hoverY * scaledCellSize + offsetY + scaledCellSize / 2);
        ctxConveyers.lineTo(hoverX * scaledCellSize + offsetX + scaledCellSize / 2, hoverY * scaledCellSize + offsetY + scaledCellSize / 2);
    }
    ctxConveyers.stroke();
    ctxConveyers.lineWidth = 1;
}

function drawComponents() {
    ctxComponents.clearRect(0, 0, canvasComponents.width, canvasComponents.height);
    target.draw((gridSize / 2) * scaledCellSize + offsetX, (gridSize / 2) * scaledCellSize + offsetY, scaledCellSize);

    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        const posX = component.tileX * scaledCellSize + offsetX;
        const posY = component.tileY * scaledCellSize + offsetY;
        component.draw(posX, posY, scaledCellSize);
        if (component == hoverOver) {
            ctxComponents.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctxComponents.fillRect(posX - component.constructor.AnchorX * scaledCellSize, posY - component.constructor.AnchorY * scaledCellSize, scaledCellSize * component.constructor.Width, scaledCellSize * component.constructor.Height);
        }
    }
}

function drawGrid() {
    ctxGrid.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
    ctxGrid.strokeStyle = '#2870A5';
    ctxGrid.lineWidth = 1;
    ctxGrid.fillStyle = '#000000';
    ctxGrid.font = `${cellSize * scale}px Arial`;
    ctxGrid.textAlign = 'center';
    ctxGrid.textBaseline = 'middle';

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const drawX = x * scaledCellSize + offsetX;
            const drawY = y * scaledCellSize + offsetY;
            if (drawX + scaledCellSize > 0 && drawX < canvasGrid.width && drawY + scaledCellSize > 0 && drawY < canvasGrid.height) {
                let cell = matrix[x][y];
                ctxGrid.fillStyle = cell.BackgroundColor;
                ctxGrid.fillRect(drawX, drawY, scaledCellSize, scaledCellSize);
                if (cell.Type == CellType.NUMBER) {
                    if (cell.Number <= target.level)
                    {
                        ctxGrid.fillStyle = '#cccccc';
                    } else {
                        ctxGrid.fillStyle = '#9999ff';
                    }
                    ctxGrid.font = `${cellSize * scale}px Arial`;
                    ctxGrid.fillText(cell.Number, drawX + scaledCellSize / 2, drawY + scaledCellSize / 2 + scale);
                }
                /*
                ctxGrid.font = `${cellSize * scale / 4.0}px Arial`;
                ctxGrid.fillStyle = '#000000'; // Ensure the fill style is set to black
                ctxGrid.fillText(cell.Type, drawX + scaledCellSize/8, drawY + scaledCellSize/8);
                */
            }
        }
    }

    if (scale >= 2) {
        ctxGrid.beginPath();
        for (let x = 0; x <= gridSize; x++) {
            const drawX = x * scaledCellSize + offsetX;
            if (drawX >= 0 && drawX <= canvasGrid.width) {
                ctxGrid.moveTo(drawX, 0);
                ctxGrid.lineTo(drawX, canvasGrid.height);
            }
        }
        for (let y = 0; y <= gridSize; y++) {
            const drawY = y * scaledCellSize + offsetY;
            if (drawY >= 0 && drawY <= canvasGrid.height) {
                ctxGrid.moveTo(0, drawY);
                ctxGrid.lineTo(canvasGrid.width, drawY);
            }
        }
        ctxGrid.stroke();
    }
    
}

function resizeCanvas() {
    canvasGrid.width = window.innerWidth;
    canvasGrid.height = window.innerHeight;
    canvasConveyers.width = window.innerWidth;
    canvasConveyers.height = window.innerHeight;
    canvasComponents.width = window.innerWidth;
    canvasComponents.height = window.innerHeight;

    drawGrid();
    drawComponents();
}

function handleScroll(event) {
    event.preventDefault();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const canvasRect = canvasGrid.getBoundingClientRect();
    const offsetXBeforeZoom = (mouseX - canvasRect.left) / scale - offsetX / scale;
    const offsetYBeforeZoom = (mouseY - canvasRect.top) / scale - offsetY / scale;

    if (event.deltaY < 0) {
        scale *= 1.1;
    } else {
        scale *= 0.9;
    }
    scale = Math.max(1, Math.min(5, scale));

    scaledCellSize = cellSize * scale;

    const offsetXAfterZoom = (mouseX - canvasRect.left) / scale - offsetX / scale;
    const offsetYAfterZoom = (mouseY - canvasRect.top) / scale - offsetY / scale;

    offsetX += (offsetXAfterZoom - offsetXBeforeZoom) * scale;
    offsetY += (offsetYAfterZoom - offsetYBeforeZoom) * scale;

    // Ensure the user cannot pan or zoom outside the grid
    const maxOffsetX = canvasGrid.width - gridSize * cellSize * scale;
    const maxOffsetY = canvasGrid.height - gridSize * cellSize * scale;
    offsetX = Math.min(0, Math.max(maxOffsetX, offsetX));
    offsetY = Math.min(0, Math.max(maxOffsetY, offsetY));
    drawGrid();
    drawComponents();
}

function setCellComponent(x, y, component) {
    var componentMatrix = component.getCellTypeAndComponentMatrix();
    let anchorX = component.constructor.AnchorX;
    let anchorY = component.constructor.AnchorY;
    for (let i = 0; i < componentMatrix.length; i++) {
        for (let j = 0; j < componentMatrix[0].length; j++) {
            let cell = matrix[x + i - anchorX][y + j - anchorY];
            cell.Component = componentMatrix[i][j].Component;
            cell.Type = componentMatrix[i][j].Type;
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
        const canvasRect = canvasGrid.getBoundingClientRect();
        const x = Math.floor((mouseX - canvasRect.left - offsetX) / (cellSize * scale));
        const y = Math.floor((mouseY - canvasRect.top - offsetY) / (cellSize * scale));
        const cell = matrix[x][y];

        // Check if starting to draw a conveyor
        if (drawMode == DrawModeType.CONVEYER
            &&x >= 0 
            && x < gridSize 
            && y >= 0 
            && y < gridSize 
            && (cell.Type==CellType.EXTRACTOR || cell.Type === CellType.CONVEYER || cell.Type === CellType.ADDER_OUT)) {
            isDrawingConveyor = true;
            conveyorStartX = x;
            conveyorStartY = y;
        } else
        // Check if placing an extractor
        if (drawMode === DrawModeType.EXTRACTOR) {
            if (cell && cell.Type === CellType.NUMBER && target.level >= cell.Number) {
                if (hoverX >= 0 && hoverY >= 0) {
                    let extractor = new Extractor(ctxComponents, cell.Number, hoverX, hoverY);
                    components.push(extractor);
                    setCellComponent(hoverX, hoverY, extractor);
                    drawComponents();
                }
            }
        } else if (drawMode == DrawModeType.ADDER) {
            if (hoverX >= 1 && hoverY >= 1 && hoverX < gridSize-1 && hoverY < gridSize-1) {
                // check if the area is empty
                let empty = true;
                for (let i = 0; i < Adder.Width; i++) {
                    for (let j = 0; j < Adder.Height; j++) {
                        if (matrix[hoverX + i][hoverY + j].Type != CellType.EMPTY) {
                            empty = false;
                            break;
                        }
                    }
                }
                if (empty) {
                    const adder = new Adder(ctxComponents, hoverX, hoverY, componentRotation);
                    components.push(adder);
                    setCellComponent(hoverX, hoverY, adder);
                    drawComponents();
                }
            }
        } else if (drawMode == DrawModeType.DEMOLISHER) {
            if (hoverOver) {
                for (let x=hoverOver.tileX; x<hoverOver.tileX+hoverOver.constructor.Width; x++) {
                    for (let y=hoverOver.tileY; y<hoverOver.tileY+hoverOver.constructor.Height; y++) {
                        matrix[x][y].Type = CellType.EMPTY;
                        matrix[x][y].Component = null;
                    }
                }
                if (hoverOver instanceof Extractor) {
                    enableNumber(hoverOver.tileX, hoverOver.tileY, hoverOver.Number);
                }
                hoverOver.destroy();
                components = components.filter(c => c !== hoverOver);
                beltGraph.
            }
            drawGrid();
            drawComponents();
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
        const maxOffsetX = canvasGrid.width - gridSize * cellSize * scale;
        const maxOffsetY = canvasGrid.height - gridSize * cellSize * scale;
        if (offsetX > 0) {
            offsetX = 0;
        }
        if (offsetY > 0) {
            offsetY = 0;
        }
        if (offsetX < maxOffsetX) {
            offsetX = maxOffsetX;
        }
        if (offsetY < maxOffsetY) {
            offsetY = maxOffsetY;
        }

        drawGrid(); // Redraw the grid with the new offset values
        drawComponents();
    } else {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Get the cell coordinates
        const canvasRect = canvasGrid.getBoundingClientRect();
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

        if (drawMode === DrawModeType.CONVEYER) {
            if ((hoverX-1==conveyorStartX && hoverY==conveyorStartY) || (hoverX+1==conveyorStartX && hoverY==conveyorStartY)) {
                conveyerDrawStartDirection = DirectionType.HORIZONTAL;
            } else if ((hoverX==conveyorStartX && hoverY-1==conveyorStartY) || (hoverX==conveyorStartX && hoverY+1==conveyorStartY)) {
                conveyerDrawStartDirection = DirectionType.VERTICAL;
            }
        } else if (drawMode == DrawModeType.DEMOLISHER) {
            if (hoverX >= 0 && hoverX < gridSize && hoverY >= 0 && hoverY < gridSize) {
                let oldHoverOver = hoverOver;
                hoverOver = matrix[hoverX][hoverY].Component;
                if (hoverOver != oldHoverOver) {
                    drawComponents();
                }
            }
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

    if (conveyerDrawStartDirection === DirectionType.HORIZONTAL) {
        const endX = x;
        const stepX = conveyorStartX < x ? 1 : -1;
        for (let i = conveyorStartX; i !== endX + stepX; i += stepX) {
            let cell = matrix[i][conveyorStartY];
            if (cell.Type === CellType.EMPTY) {
                inEmptycell = true;
                if (cellPoints.length === 0) {
                    cellPoints.push({ x: i-stepX, y: conveyorStartY });
                }
            } else if (cell.Type != CellType.EMPTY && inEmptycell) {
                cellPoints.push({ x: i, y: conveyorStartY });
                return cellPoints;
            } else if (cell.Type === CellType.CONVEYER && i===conveyorStartX) { // we start in a conveyer cell
                cellPoints.push({ x:i,  y: conveyorStartY });
            }
        }
        cellPoints.push({ x: endX, y: conveyorStartY });

        if (dy == 0) {
            return cellPoints;
        }

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
                cellPoints.push({ x: endX, y: j });
                return cellPoints;
            }
        }
        cellPoints.push({ x: endX, y: endY });
    } else {
        const endY = y;
        const stepY = conveyorStartY < y ? 1 : -1;
        for (let j = conveyorStartY; j !== endY + stepY; j += stepY) {
            let cell = matrix[conveyorStartX][j];
            if (cell.Type === CellType.EMPTY) {
                inEmptycell = true;
                if (cellPoints.length === 0) {
                    cellPoints.push({ x: conveyorStartX, y: j-stepY });
                }
            } else if (cell.Type != CellType.EMPTY && inEmptycell) {
                cellPoints.push({ x: conveyorStartX, y: j });
                return cellPoints;
            } else if (cell.Type === CellType.CONVEYER && j===conveyorStartY) { // we start in a conveyer cell
                cellPoints.push({ x: conveyorStartX, y: j });
            }
        }
        cellPoints.push({ x: conveyorStartX, y: endY });

        if (dx == 0) {
            return cellPoints;
        }

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
                cellPoints.push({ x: i, y: endY });
                return cellPoints;
            }
        }
        cellPoints.push({ x: endX, y: endY });
    }

    return cellPoints;
}

function updateHorizontalCellsToConveyer(start, end, beltSegment) {
    let i = start.x;
    const step = (end.x > start.x) ? 1 : -1;
    while (i !== end.x) {
        let cell = matrix[i][start.y];
        if (cell.Type === CellType.EMPTY || cell.Type === CellType.CONVEYER) {
            cell.Type = CellType.CONVEYER;
            cell.Component = beltSegment;
        }
        i += step;
    }
    cell = matrix[end.x][start.y];
    if (cell.Type === CellType.EMPTY || cell.Type === CellType.CONVEYER) {
        cell.Type = CellType.CONVEYER;
        cell.Component = beltSegment;
    }
}

function updateVerticalCellsToConveyer(start, end, beltSegment) {
    let j = start.y;
    const step = (end.y > start.y) ? 1 : -1;
    while (j !== end.y) {
        let cell = matrix[start.x][j];
        if (cell.Type === CellType.EMPTY || cell.Type === CellType.CONVEYER) {
            cell.Type = CellType.CONVEYER;
            cell.Component = beltSegment;
        }
        j += step;
    }
    cell = matrix[start.x][end.y];
    if (cell.Type === CellType.EMPTY || cell.Type === CellType.CONVEYER) {
        cell.Type = CellType.CONVEYER;
        cell.Component = beltSegment;
    }
}

function UpdateCellsToConveyer(beltSegment) {
    var points = beltSegment.points;
    for (let i = 0; i < points.length - 1; i++) {
        if (points[i].x === points[i + 1].x) {
            updateVerticalCellsToConveyer(points[i], points[i + 1], beltSegment);
        } else {
            updateHorizontalCellsToConveyer(points[i], points[i + 1], beltSegment);
        }
    }
}

function createConveyer(points) {
    let cellStart = matrix[points[0].x][points[0].y];
    let startComponent = cellStart.Component;
    let cellEnd = matrix[points[points.length - 1].x][points[points.length - 1].y];
    let endComponent = cellEnd.Component;
    if (startComponent != endComponent && !(endComponent instanceof Extractor)) {
        let result = null;
        let canAddBelt = true;

        if (startComponent instanceof Adder) {
            canAddBelt = startComponent.canAddBelt(cellStart.Type);
        }

        if (endComponent instanceof Adder) {
            canAddBelt = endComponent.canAddBelt(cellEnd.Type);
        } 

        if (canAddBelt) {
            result = beltGraph.addBelt(points, startComponent, endComponent);
            if (startComponent instanceof Adder && startComponent.canAddBelt(cellStart.Type)) {
                startComponent.setBelt(result.beltSegments[0], cellStart.Type);
            }

            if (endComponent instanceof Adder && endComponent.canAddBelt(cellEnd.Type)) {
                endComponent.setBelt(result.beltSegments[0], cellEnd.Type);
            }
        }
        if (result)
        {
            if (result.beltSegments) {
                for (let beltSegment of result.beltSegments) {
                    UpdateCellsToConveyer(beltSegment);
                }
            }
            if (result.junctions) {
                for (let junction of result.junctions) {
                    matrix[junction.x][junction.y].Component = junction;
                    matrix[junction.x][junction.y].Type = CellType.JUNCTION;
                }
            }
            validateMatrixAndBeltGraph();
        }    
    }
}

function convertToConveyer(mouseX, mouseY) {
    const canvasRect = canvasGrid.getBoundingClientRect();
    const x = Math.floor((mouseX - canvasRect.left - offsetX) / (cellSize * scale));
    const y = Math.floor((mouseY - canvasRect.top - offsetY) / (cellSize * scale));

    let points = getConveyerLineCellPoints(x, y);

    createConveyer(points);
}

function handleMouseUp(event) {
    if (event.button === 2) { // Right mouse button
        isDragging = false;
    } else if (event.button === 0 && isDrawingConveyor) { // Left mouse button
        isDrawingConveyor = false;
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        convertToConveyer(mouseX, mouseY);
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
    enableButton('adderButton', () => {
        drawMode = DrawModeType.ADDER;
    });

    const statisticsContent = document.getElementById('statisticsContent');
    const statisticsView = document.getElementById('statisticsView');
    const statisticsButton = document.getElementById('statisticsButton');

    statisticsButton.addEventListener('click', () => {
        statisticsTimer = setInterval(() => {
        statisticsContent.innerHTML = '';
        for (let number in target.numberCounts) {
            const count = target.numberCounts[number];
            const div = document.createElement('div');
            div.innerText = `${number}: ${count}`;
            statisticsContent.appendChild(div);
        }
        }, 1000);
        statisticsView.style.display = "block";
    });

    document.getElementById('statisticsCloseButton').addEventListener('click', () => {
        clearInterval(statisticsTimer);
        statisticsView.style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', initializeButtons);

window.addEventListener('resize', resizeCanvas);
canvasComponents.addEventListener('wheel', handleScroll);
canvasComponents.addEventListener('mousedown', handleMouseDown);
canvasComponents.addEventListener('mousemove', handleMouseMove);
canvasComponents.addEventListener('mouseup', handleMouseUp);
canvasComponents.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        if (event.shiftKey) {
            // Counter-clockwise rotation
            componentRotation = (componentRotation - 1 + 4) % 4;
        } else {
            // Clockwise rotation
            componentRotation = (componentRotation + 1) % 4;
        }
    }
});

resizeCanvas();
offsetX = canvasGrid.width / 2 - (gridSize * cellSize * scale) / 2;
offsetY = canvasGrid.height / 2 - (gridSize * cellSize * scale) / 2;

function mainLoop() {
    ctxConveyers.clearRect(0, 0, canvasConveyers.width, canvasConveyers.height);
    beltGraph.draw(ctxConveyers, cellSize, scale, offsetX, offsetY);

    if (isDrawingConveyor && conveyorStartX >= 0 && conveyorStartY >= 0) {
        drawSuggestedConveyer();
    } else if (drawMode == DrawModeType.CONVEYER && hoverX >= 0 && hoverY >= 0 && hoverX < gridSize && hoverY < gridSize) {
        ctxConveyers.fillStyle = 'rgba(0, 255, 0, 0.25)';
        const drawX = hoverX * scaledCellSize + offsetX;
        const drawY = hoverY * scaledCellSize + offsetY;
        ctxConveyers.fillRect(drawX, drawY, scaledCellSize, scaledCellSize);
    } else if (drawMode == DrawModeType.DEMOLISHER && hoverX >= 1 && hoverY >= 1 && hoverX < gridSize-1 && hoverY < gridSize-1) {
        ctxConveyers.fillStyle = 'rgba(255, 0, 0, 0.25)';
        const drawX = hoverX * scaledCellSize + offsetX;
        const drawY = hoverY * scaledCellSize + offsetY;
        ctxConveyers.fillRect(drawX, drawY, scaledCellSize, scaledCellSize);
    } else if (drawMode == DrawModeType.EXTRACTOR && hoverX >= 1 && hoverY >= 1 && hoverX < gridSize-1 && hoverY < gridSize-1) {
        ctxConveyers.fillStyle = 'rgba(255, 0, 0, 0.25)';
        const drawX = (hoverX - 1) * scaledCellSize + offsetX;
        const drawY = (hoverY - 1) * scaledCellSize + offsetY;
        ctxConveyers.fillRect(drawX, drawY, scaledCellSize * 3, scaledCellSize * 3);
    } else if (drawMode == DrawModeType.ADDER && hoverX >= 1 && hoverY >= 1 && hoverX < gridSize-1 && hoverY < gridSize-1) {
        const adder = new Adder(ctxConveyers, hoverX, hoverY, componentRotation);
        adder.draw(hoverX * scaledCellSize + offsetX, hoverY * scaledCellSize + offsetY, scaledCellSize, true);
    }


    requestAnimationFrame(mainLoop);
}

//todo: remove this function in the final product, this is just to confirm that the belt graph and matrix are in sync
function validateMatrixAndBeltGraph() {
    var beltSegments = beltGraph.beltSegments;
    for (let beltSegment of beltSegments) {
        for (let i = 0; i < beltSegment.points.length - 1; i++) {
            let start = beltSegment.points[i];
            let end = beltSegment.points[i + 1];
            if (start.x === end.x) {
                // Vertical segment
                let step = start.y < end.y ? 1 : -1;
                for (let y = start.y; y !== end.y + step; y += step) {
                    let cell = matrix[start.x][y];
                    if (cell.Type != CellType.JUNCTION && cell.Type != CellType.NUMBERBUFFER && cell.Type != CellType.TARGET && cell.Component != beltSegment) {
                        console.log('matrix(' + start.x + ',' + y + ') does not match belt segment !');
                    }
                }
            } else {
                // Horizontal segment
                let step = start.x < end.x ? 1 : -1;
                for (let x = start.x; x !== end.x + step; x += step) {
                    let cell = matrix[x][start.y];
                    if (cell.Type != CellType.JUNCTION && cell.Type != CellType.NUMBERBUFFER && cell.Type != CellType.TARGET && cell.Component != beltSegment) {
                        console.log('matrix(' + x + ',' + start.y + ') does not match belt segment !');
                    }
                }
            }
        }
    }
}

// Game engine background worker that runs independant of frame rate / screen update
function tick() {
   beltGraph.tick();
}

drawGrid();
drawComponents();
mainLoop();
setInterval(tick, tickDelay);