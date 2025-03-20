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

class Extractor {
    static AnchorX = 1;
    static AnchorY = 1;
    static Width = 3;
    static Height = 3;

    constructor(ctx, number, tileX, tileY) {
        this.ctx = ctx;
        this.Number = number;
        this.tileX = tileX;
        this.tileY = tileY;
        this.belts = [];
        this.beltsPerSecond = 2.0 * numbersPerSecondFromExtractors;
        this.lastNumberTime = Date.now();
        this.lastBeltOutputIndex = -1;
        this.tickDelay= 1000.0 / this.beltsPerSecond;
        this.numberTimer = setInterval(() => this.outputNumbers(), this.tickDelay);
    }

    draw(x, y, zoom) {
        const radius = zoom/4;
        const lineWidth = zoom * 0.05;
        const size = Extractor.Width * zoom - lineWidth;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = lineWidth;

        this.ctx.beginPath();
        this.ctx.roundRect(x - zoom * Extractor.AnchorX, y - zoom * Extractor.AnchorY, size, size, radius);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.roundRect(x - zoom * Extractor.AnchorX, y - zoom * Extractor.AnchorY, size, size, radius);
        this.ctx.closePath();
        this.ctx.stroke();

        // draw count and target count as x/y in the center
        this.ctx.fillStyle = 'white';
        this.ctx.font = Math.round(zoom*2) + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.Number, x+zoom*0.5, y+zoom*1.25);
    }

    addBelt(belt) {
        this.belts.push(belt);
    }

    outputNumbers() {
        if (this.belts.length == 0) {
            return;
        }
        this.lastBeltOutputIndex = (this.lastBeltOutputIndex + 1) % this.belts.length;
        const belt = this.belts[this.lastBeltOutputIndex];
        if (belt.hasRoomForItem()){
            belt.addItem(new BeltItem(this.Number));
        }
    }

    getCellTypeAndComponentMatrix() {
        // create 3x3 2d array
        let componentMatrix = [];
        for (let x = 0; x < Extractor.Width; x++) {
            componentMatrix[x] = [];
            for (let y = 0; y < Extractor.Height; y++) {
                var cell = new Cell();
                cell.Component = this;
                cell.Type = CellType.EXTRACTOR;
                componentMatrix[x][y] = cell;
            }
        }
        return componentMatrix;
    }

    removeBelt(belt) {
        const index = this.belts.indexOf(belt);
        if (index > -1) {
            this.belts.splice(index, 1);
        }
    }

    destroy() {
        clearInterval(this.numberTimer);
        this.numberTimer = null;
        for (let belt of this.belts) {
            belt.prev = null;
        }
    }
}
