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

class Graph {
    constructor() {
        this.beltSegments = [];
    }
    updateBeltItems(beltSegment, deltaTime, speed) {
        for (let item of beltSegment.items) {
            item.position += (deltaTime * speed) / beltSegment.length;
            if (item.position >= 1.0) {
                // Handle item reaching the end of the segment
                item.position = 1.0;
                // Transfer to the next segment or process the item
            }
        }
        // Remove items that have reached the end if they are processed
        beltSegment.items = beltSegment.items.filter(item => item.position < 1.0);
    }

    transferItemToNextSegment(item, nextSegment) {
        if (nextSegment.items.length < nextSegment.length) {
            item.position = 0.0; // Reset position for the new segment
            nextSegment.items.push(item);
        } else {
            // Handle case where the next segment is full (e.g., pause the item)
        }
    }

    addBelt(points, prev, next) {
        const segment = new BeltSegment(points, prev, next);
        // Add the segment to your belt management system
        this.beltSegments.push(segment);
    }

    renderBeltItems(ctx, beltSegment, cellSize) {
        for (let item of beltSegment.items) {
            let x = beltSegment.start.x * cellSize;
            let y = beltSegment.start.y * cellSize;

            if (beltSegment.direction === "horizontal") {
                x += item.position * beltSegment.length * cellSize;
            } else if (beltSegment.direction === "vertical") {
                y += item.position * beltSegment.length * cellSize;
            }

            // Draw the item (e.g., as a rectangle or image)
            ctx.fillStyle = 'blue'; // Example color
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }

    draw(ctx, cellSize, scale, offsetX, offsetY, timestamp) {
        // Search for belt segments where the next property is of type Target
        const targetSegments = this.beltSegments.filter(segment => segment.next instanceof Target);
        // next we find all belt segments that end in nothing
        const endSegments = this.beltSegments.filter(segment => !segment.next);
        

        const conveyerAnimationStep = Math.round(timestamp / beltAnimationSpeed) % beltAnimationSteps;
        const cellSizeScale = cellSize * scale;
        const halfCellSizeScaled = cellSizeScale / 2;
        const beltLineWidth = cellSize * beltWidthPercentage * scale;
        const offsetoffsetXHalfCellSizeScaled = offsetX + halfCellSizeScaled;
        const offsetoffsetYHalfCellSizeScaled = offsetY + halfCellSizeScaled;

        // Draw the belts
        for (let segment of targetSegments) {
            for (let i = 0; i < segment.points.length - 1; i++) {
                ctx.strokeStyle = 'black'; // Example color for target segments
                ctx.lineWidth = beltLineWidth; // Make the line cover the tiles

                let startX = segment.points[i].x * cellSizeScale + offsetoffsetXHalfCellSizeScaled;
                let startY = segment.points[i].y * cellSizeScale + offsetoffsetYHalfCellSizeScaled;
                let endX = segment.points[i + 1].x * cellSizeScale + offsetoffsetXHalfCellSizeScaled;
                let endY = segment.points[i + 1].y * cellSizeScale + offsetoffsetYHalfCellSizeScaled;

                const direction = segment.points[i].x === segment.points[i + 1].x ? DirectionType.VERTICAL : DirectionType.HORIZONTAL;
                const dx = segment.points[i].x > segment.points[i + 1].x ? -1 : 1;
                const dy = segment.points[i].y > segment.points[i + 1].y ? -1 : 1;

                // Extend the lines by half a cell size
                if (direction === DirectionType.VERTICAL) { // Vertical line
                    if (i === 0 && segment.prev) {
                        startY += dy * halfCellSizeScaled; // if first segment is connected, draw the line to the edge of the cell
                    } else {
                        startY -= ctx.lineWidth / 2 * dy; // Else it's part of a bend and needs to be drawn at the edge of that belt
                    }
                    if (i === segment.points.length - 2 && segment.next) {
                        endY += dy * halfCellSizeScaled; // if last segment is connected, draw the line to the edge of the cell
                    }
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                } else { // Horizontal line
                    if (i === 0 && segment.prev) {
                        startX -= dx * halfCellSizeScaled; // if first segment is connected, draw the line to the edge of the cell
                    } else {
                        startX -= ctx.lineWidth / 2 * dx; // Else it's part of a bend and needs to be drawn at the edge of that belt
                    }
                    if (i === segment.points.length - 2 && segment.next) {
                        startX += dx * halfCellSizeScaled; // if last segment is connected, draw the line to the edge of the cell
                    }
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        }

        // Draw the triangles
        for (let segment of targetSegments) {
            for (let i = 0; i < segment.points.length - 1; i++) {
                let startX = segment.points[i].x * cellSizeScale + offsetoffsetXHalfCellSizeScaled;
                let startY = segment.points[i].y * cellSizeScale + offsetoffsetYHalfCellSizeScaled;
                const direction = segment.points[i].x === segment.points[i + 1].x ? DirectionType.VERTICAL : DirectionType.HORIZONTAL;
                const dx = segment.points[i].x > segment.points[i + 1].x ? -1 : 1;
                const dy = segment.points[i].y > segment.points[i + 1].y ? -1 : 1;
                const width = Math.abs(segment.points[i].x - segment.points[i + 1].x);
                const height = Math.abs(segment.points[i].y - segment.points[i + 1].y);

                // Draw multiple small triangles inside the entire line pointing in the direction of the conveyor and offset them with the timestamp
                if (direction === DirectionType.VERTICAL) { // Vertical line
                    let shift = dy * conveyerAnimationStep / beltAnimationSteps * cellSizeScale;
                    for (let j = 0; j < height; j++) {
                        ctx.fillStyle = 'GoldenRod';
                        ctx.beginPath();
                        ctx.moveTo(startX - dx * cellSizeScale / 12, startY + dy * j * cellSizeScale + shift);
                        ctx.lineTo(startX + dx * cellSizeScale / 12, startY + dy * j * cellSizeScale + shift);
                        ctx.lineTo(startX, startY + dy * (j + 0.2) * cellSizeScale + shift);
                        ctx.fill();
                    }
                } else { // Horizontal line
                    let shift = dx * conveyerAnimationStep / beltAnimationSteps * cellSizeScale;
                    for (let j = 0; j < width; j++) {
                        ctx.fillStyle = 'GoldenRod';
                        ctx.beginPath();
                        ctx.moveTo(startX + dx * j * cellSizeScale + shift, startY - dy * cellSizeScale / 12);
                        ctx.lineTo(startX + dx * j * cellSizeScale + shift, startY + dy * cellSizeScale / 12);
                        ctx.lineTo(startX + dx * (j + 0.2) * cellSizeScale + shift, startY);
                        ctx.fill();
                    }
                }
            }
        }
    }
}