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

class BeltGraph {
    constructor() {
        this.beltSegments = [];
        this.junctions = [];
    }

    tick() {
        conveyerAnimationStep = (conveyerAnimationStep + beltSpeed*2.05) % beltAnimationSteps
        for (let segment of this.beltSegments) {
            segment.moveBeltItems(segment);
        }
    }

    transferItemToNextSegment(item, nextSegment) {
        if (nextSegment.items.length < nextSegment.length) {
            item.position = 0.0; // Reset position for the new segment
            nextSegment.items.push(item);
        } else {
            // Handle case where the next segment is full (e.g., pause the item)
        }
    }

    /// <summary>
    /// Add a belt segment to the graph
    /// </summary>
    /// <param name="points">The points that make up the belt segment</param>
    /// <param name="prev">The component, belt or junction where the belt should start from</param>
    /// <param name="next">The component, belt or junction where the belt is ending</param>
    addBelt(points, prev, next) {
        let result ={ beltSegments: [], junctions: [] };
        let newSegment = null;
        if (prev && prev instanceof BeltSegment) {
            // Check if the new belt segment starts where the previous one ended
            if (points[0].x === prev.points[prev.points.length - 1].x && points[0].y === prev.points[prev.points.length - 1].y) {
                prev.extendBeltSegment(points, next);
                result.beltSegments.push(prev);
                newSegment = prev;      
            } else // We are splitting a new belt from somewhere in between the start and end
            {
                let junction = new Junction(points[0].x, points[0].y); // Create a junction for the split
                this.junctions.push(junction);
                let cutSegment = prev.cutBeltSegmentAt(points[0].x, points[0].y);
                this.beltSegments.push(cutSegment);
                prev.next = junction; // Connect the current belt to the junction
                junction.addOutput(cutSegment);
                cutSegment.prev = junction;                
                newSegment = new BeltSegment(points, junction, next);
                junction.addOutput(newSegment);
                result.beltSegments.push(prev);
                this.beltSegments.push(newSegment);
                result.beltSegments.push(cutSegment);
                result.beltSegments.push(newSegment);
                result.junctions.push(junction);
            }
        }
        if (next && next instanceof BeltSegment) { // merge belt into existing beltsegment
            // Does belt segment end where the new belt segment starts?
            if (points[points.length - 1].x === next.points[0].x && points[points.length - 1].y === next.points[0].y) {
                prev.extendBeltSegment(points, next);
                result.beltSegments.push(prev);   
                newSegment = prev;     
            } else // We are marging the new belt somewhere in between two points
            {
                let junction = new Junction(points[points.length - 1].x, points[points.length - 1].y); // Create a junction for the split
                this.junctions.push(junction);
                let cutSegment = next.cutBeltSegmentAt(points[points.length - 1].x, points[points.length - 1].y);
                this.beltSegments.push(cutSegment);
                next.next = junction; // Connect the current belt to the junction
                junction.addOutput(cutSegment);
                cutSegment.prev = junction;

                if (newSegment == null) {
                    newSegment = new BeltSegment(points, prev, junction);
                    this.beltSegments.push(newSegment);
                    result.beltSegments.push(newSegment);
                } else {
                    newSegment.next = junction;
                }

                if (prev instanceof Extractor) {
                    prev.addBelt(newSegment);
                }
                result.beltSegments.push(next);
                result.beltSegments.push(cutSegment);
                result.junctions.push(junction);
            }
        }
        if (newSegment == null)
        {
            newSegment = new BeltSegment(points, prev, next);
            if (prev!=null) {
                if (prev instanceof Junction) {
                    prev.addOutput(newSegment);
                } else if (prev instanceof Extractor) {
                    prev.addBelt(newSegment);
                }
            }
            if (next!=null) {
                if (next instanceof Junction) {
                    next.addOutput(newSegment);
                }
            }
            this.beltSegments.push(newSegment);
            result.beltSegments.push(newSegment);
        }
        return result;
    }

    draw(ctx, cellSize, scale, offsetX, offsetY) {
        const cellSizeScale = cellSize * scale;
        const halfCellSizeScaled = cellSizeScale / 2;
        const beltLineWidth = cellSize * beltWidthPercentage * scale;
        const offsetoffsetXHalfCellSizeScaled = offsetX + halfCellSizeScaled;
        const offsetoffsetYHalfCellSizeScaled = offsetY + halfCellSizeScaled;
        const beltEndOffset = cellSizeScale - (beltLineWidth * 2.0) // New offset for belt end

        // Draw the belts
        for (let segment of this.beltSegments) {
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
                    if (i>0 && i<segment.points.length-1)
                    {
                        startY -= ctx.lineWidth / 2 * dy;
                    }    
                    //endY -= beltEndOffset * dy; // Adjust end position
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                } else { // Horizontal line
                    if (i>0 && i<segment.points.length-1)
                    {
                        startX -= ctx.lineWidth / 2 * dx; // Else it's part of a bend and needs to be drawn at the edge of that belt
                    }
                    //endX -= beltEndOffset * dx; // Adjust end position
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        }

        // Draw the triangles
        for (let segment of this.beltSegments) {
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
        
        for (let segment of this.beltSegments) {
            // Loop through each item in belt segment and use its precomputed position
            for (let item of segment.items) {
                let x = item.x * cellSizeScale + offsetoffsetXHalfCellSizeScaled;
                let y = item.y * cellSizeScale + offsetoffsetYHalfCellSizeScaled;
                // draw the number at x, y
                ctx.fillStyle = 'white';
                ctx.font = Math.round(cellSizeScale / 2) + 'px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.number, x, y + cellSizeScale / 6);
            }
        }
    }
}