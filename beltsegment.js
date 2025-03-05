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

// Belt segments represents a belt including bends between two nodes. A node is either a component like an extractor or target or a split or join of belt segments.
class BeltSegment {
    constructor(points, prev, next) {
        this.points = points;
        this.prev = prev;
        this.next = next;
        this.items = []; // [{ type: 'BeltItem', distance: 0.0 }]
        this.length = 0;
        this.segmentCells = [];
        this.calculateLength();
    }

    calculateLength() {
        let length = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            length += Math.sqrt(Math.pow(this.points[i].x - this.points[i + 1].x, 2) + Math.pow(this.points[i].y - this.points[i + 1].y, 2));
        }
        this.length = length;
        this.segmentCells = [];
        for (let i = 0; i < this.points.length - 1; i++) {
            let dx = this.points[i + 1].x - this.points[i].x;
            let dy = this.points[i + 1].y - this.points[i].y;
            let length = Math.abs(this.points[i + 1].x - this.points[i].x) + Math.abs(this.points[i + 1].y - this.points[i].y);
            dx = dx / length;
            dy = dy / length;
            let x = this.points[i].x;
            let y = this.points[i].y;
            if (i==this.points.length-2) {
                length++;
            }
            for (let j = 0; j < length; j++) {
                this.segmentCells.push({ x, y, dx, dy });
                x += dx;
                y += dy;
            }
        }
    }

    getPointIndex(x, y) {
        for (let i = 0; i < this.points.length; i++) {
            if (this.points[i].x === x && this.points[i].y === y) {
                return i;
            }
        }
        return -1;
    }

    getOverflowItems() {
        let overflown = [];
        while (this.items.length > 0 && this.items[0].distance >= this.length) {
            let item = this.items.shift();
            item.distance -= this.length;
            overflown.push(item);
        }
        return overflown;
    }

    pointBetweenTwoPoints(x, y, p1, p2) {
        return (p1.x <= x && x <= p2.x && p1.y <= y && y <= p2.y) || (p1.x >= x && x >= p2.x && p1.y >= y && y >= p2.y);
    }

    extendBeltSegment(points, next) {
        // if if the first segment is the same direction as the last segment, we can move the last point in prev to the second point in points array
        // In other words, we just extend the current line segment to cover both the old end segment and the start of the new segment
        if (getDirectionType(points[0], points[1]) === getDirectionType(this.points[this.points.length - 2], this.points[this.points.length - 1])) {
            points = points.slice(1); // Remove the first point which is identical to the last point of the previous segment
            this.points[this.points.length - 1] = points[0];
            points = points.slice(1);
            if (points.length>0) {
                this.points = this.points.concat(points);
            }
        } else {
            points = points.slice(1); // Remove the first point which is identical to the last point of the previous segment
            // Add rest of points to the existing belt
            this.points = this.points.concat(points);
        }
        if (next)
        {
            this.next = next;
        }
        // Recalculate the length of the belt
        this.calculateLength();
    }

    cutBeltSegmentAt(x, y) {
        let pointIndex = this.getPointIndex(x, y);
        if (pointIndex == 0) {
            // We should handle this outside of the cut, since it makes no sense to call cut when it's an append
            // Reverse the points and append to the start of the belt, but then we should also swap prev and next in case it's connected to a target or extractor
            // In that case we need to check what is at the end of the original, so we do not connect two extractors or targets
            return null;
        } else if (pointIndex > 0) {
            // Easy, cut at the point
            let newPoints = this.points.slice(pointIndex);
            this.points = this.points.slice(0, pointIndex + 1);
            let next = this.next;
            this.calculateLength();
            let newSegment = new BeltSegment(newPoints, null, next);
            // get all items after the new length and move them to a new belt segment
            let overflownItems = this.getOverflowItems();
            newSegment.items = overflownItems;
            return newSegment;
        } else {
            // find the segment where the point is and cut it there
            // Walk along all cells that the line segement goes through and find the point
            for (let i = 0; i < this.points.length - 1; i++) {
                let p1 = this.points[i];
                let p2 = this.points[i + 1];
                let intersects = this.pointBetweenTwoPoints(x, y, p1, p2);
                if (intersects) {
                    // cut the belt at p2 (points[i+1]) and add point x,y at the ned of the old segment and x,y as a new point at the start of the cut segment
                    let newPoints =[{x: x, y:y}].concat(this.points.slice(i + 1));
                    this.points = this.points.slice(0, i + 1);
                    this.points.push({ x, y });
                    let next = this.next;
                    this.calculateLength();
                    let newSegment = new BeltSegment(newPoints, null, next);
                    let overflownItems = this.getOverflowItems();
                    newSegment.items = overflownItems;
                    return newSegment;
                }
            }
        }
    }

    moveBeltItems() {
        if (this.items.length > 0 && this.items[0].distance >= this.length) {
            if (this.next instanceof Target)
            {
                let item = this.items.shift();
                this.next.addNumber(item.number);
            } else if (this.next instanceof Junction)
            {
                let junction = this.next;
                var outputBelts = junction.getOutputBelts();
                for (let belt of outputBelts) {
                    if (belt.hasRoomForItem()) {
                        let item = this.items.shift();
                        item.distance = 0;
                        belt.addItem(item);
                        break;
                    }
                } 
            }
        }

        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            let canMove = item.distance < this.length;
            if (canMove && i>0) {
                canMove = this.items[i-1].distance - item.distance >= 1;
            }
            if (canMove) {
                item.distance += tickDelay*beltSpeed/1000;
                if (item.distance > this.length) {
                    item.distance = this.length;
                } else if (i > 0 && this.items[i-1].distance - item.distance < 1) {
                    item.distance = this.items[i-1].distance - 1;
                }
                this.updateItemPosition(item);
            }
        }
    }
 
    updateItemPosition(item) {
        const position = item.distance / this.segmentCells.length;
        const cellIndex = Math.floor(position * this.segmentCells.length);
        const endofbelt = cellIndex >= this.segmentCells.length - 1;
        let cell = this.segmentCells[this.segmentCells.length - 1];
        if (!endofbelt) {
            cell = this.segmentCells[cellIndex];
            if (!cell || !cell.x) {
                console.log("No cell found");
            }
        }
        let x = cell.x;
        let y = cell.y;
        if (!endofbelt) {
            x += cell.dx * (position * this.segmentCells.length - cellIndex);
            y += cell.dy * (position * this.segmentCells.length - cellIndex);
        }
        item.x = x;
        item.y = y;
    }

    hasRoomForItem() {
        return this.items.length==0 || (this.items.length < this.length && this.items[this.items.length - 1].distance >= 1.0);
    }

    addItem(item) {
        this.items.push(item);
    }
}
