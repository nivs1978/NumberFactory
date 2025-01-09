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

class BeltSegment {
    constructor(start, end, direction) {
        this.start = start; // { x, y }
        this.end = end; // { x, y }
        this.direction = direction; // DrawStartDirectionType
        this.length = this.calculateLength();
        this.items = []; // [{ type: 'itemType', position: 0.0 }]
    }

    calculateLength() {
        return this.direction === DrawStartDirectionType.HORIZONTAL
            ? this.end.x - this.start.x
            : this.end.y - this.start.y;
    }
}
