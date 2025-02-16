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
class Junction {
    constructor(x,y) {
        this.outputs = [];
        this.outputIndex = 0;
        this.x = x;
        this.y = y;
    }

    addOutput(beltSegment) {
        this.outputs.push(beltSegment);
    }

    getOutputBelts() {
        let output = [];
        for (let i=0; i<this.outputs.length; i++) {
            output.push(this.outputs[this.outputIndex]);
            this.outputIndex = (this.outputIndex + 1) % this.outputs.length;
        }
        this.outputIndex = (this.outputIndex + 1) % this.outputs.length; // Make sure to round robin the outputs
        return output;
    }
}