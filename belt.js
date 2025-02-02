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

class BeltItem {
    constructor(number) {
        this.number = number; // e.g., 'package'
        this.distance = 0.0; // Start at the beginning of the belt segment, 1.0 is the end
    }
}

// Belt segments represents a belt including bends between two nodes. A node is either a component like an extractor or target or a spli or join of belt segments.
class BeltSegment {
    constructor(points, prev, next) {
        this.points = points;
        this.prev = prev;
        this.next = next;
        this.length = this.calculateLength();
        this.items = []; // [{ type: 'BeltItem', distance: 0.0 }]
    }

    calculateLength() {
        let length = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            length += Math.sqrt(Math.pow(this.points[i].x - this.points[i + 1].x, 2) + Math.pow(this.points[i].y - this.points[i + 1].y, 2));
        }
        return length;
    }
}
