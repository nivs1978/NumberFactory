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
        this.length = this.calculateLength();
        this.items = []; // [{ type: 'BeltItem', distance: 0.0 }]

        this.segmentCells = [];
        for (let i = 0; i < points.length - 1; i++) {
            let dx = points[i + 1].x - points[i].x;
            let dy = points[i + 1].y - points[i].y;
            let length = Math.abs(points[i + 1].x - points[i].x) + Math.abs(points[i + 1].y - points[i].y);
            dx = dx / length;
            dy = dy / length;
            let x = points[i].x;
            let y = points[i].y;
            if (i==points.length-2) {
                length++;
            }
            for (let j = 0; j < length; j++) {
                this.segmentCells.push({ x, y, dx, dy });
                x += dx;
                y += dy;
            }
        }

    }

    calculateLength() {
        let length = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            length += Math.sqrt(Math.pow(this.points[i].x - this.points[i + 1].x, 2) + Math.pow(this.points[i].y - this.points[i + 1].y, 2));
        }
        return length;
    }

    moveBeltItems() {
        if (this.items.length > 0 && this.items[0].distance >= this.length-1) {
            if (this.next instanceof Target)
            {
                let item = this.items.shift();
                this.next.addNumber(item.number);
            }
        }

        for (let i = this.items.length-1;i>=0;i--) {
            let item = this.items[i];
            var canMove = item.distance < this.length+2;
            if (i>0) {
                canMove = this.items[i-1].distance - item.distance >= 1.0;
            }
            if (canMove) {
                item.distance += tickDelay*beltSpeed/1000;
                this.updateItemPosition(item);                
            }
        }
        // check if item at position 0 is at end of belt and transfer it to next belt, target or component
    }
 
    updateItemPosition(item) {
        const position = item.distance / this.length;
        const cellIndex = Math.floor(position * this.segmentCells.length);
        const endofbelt = cellIndex >= this.segmentCells.length - 1;
        let cell = this.segmentCells[this.segmentCells.length - 1];
        if (!endofbelt) {
            cell = this.segmentCells[cellIndex];
        }
        let x = cell.x;
        let y = cell.y;
        if (!endofbelt) {
            x += cell.dx * (position * this.segmentCells.length - cellIndex);
            y += cell.dy * (position * this.segmentCells.length - cellIndex);
        }
        item.x=x;
        item.y=y;
    }

    hasRoomForItem() {
        return this.items.length==0 || (this.items.length < this.length && this.items[this.items.length - 1].distance > 1.0);
    }

    addItem(item) {
        this.items.push(item);
    }
}
