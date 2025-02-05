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

class Target {
    constructor(ctx) {
        this.ctx = ctx;
        this.Level = 1;
        this.Count = 0;
        this.TargetCount = 10;
    }

    draw(x, y, zoom) {
        const radius = zoom/4;
        const lineWidth = zoom * 0.05;
        const size = 6 * zoom - lineWidth;

        roundGradientRect(this.ctx, x - size / 2 + lineWidth, y - size / 2 + lineWidth, size, size, radius, "#00BFFF", "#005F7F");

        this.ctx.fillStyle = '#9999ff';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = lineWidth;

        this.ctx.beginPath();
        this.ctx.roundRect(x - size / 2, y - size / 2, size, size, radius);
        this.ctx.closePath();
        this.ctx.stroke();

        // Draw level at top center of target
        this.ctx.fillStyle = 'white';
        this.ctx.font = Math.round(zoom*2) + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.Level, x, y - size / 5);

        // draw count and target count as x/y in the center
        this.ctx.fillStyle = 'lightgreen';
        this.ctx.font = Math.round(zoom) + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.Count + '/' + this.TargetCount, x, y);
    }
}
