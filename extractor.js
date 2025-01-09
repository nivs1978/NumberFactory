class Extractor {
    constructor(ctx, number, tileX, tileY) {
        this.ctx = ctx;
        this.Number = number;
        this.tileX = tileX;
        this.tileY = tileY;
    }

    draw(x, y, zoom) {
        const radius = zoom/4;
        const lineWidth = zoom * 0.05;
        const size = 3 * zoom - lineWidth;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = lineWidth;

        this.ctx.beginPath();
        this.ctx.roundRect(x - size / 2 + lineWidth, y - size / 2 + lineWidth, size, size, radius);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.roundRect(x - (size-lineWidth) / 2, y - (size-lineWidth) / 2, size, size, radius);
        this.ctx.closePath();
        this.ctx.stroke();

        // draw count and target count as x/y in the center
        this.ctx.fillStyle = 'white';
        this.ctx.font = Math.round(zoom*2) + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.Number, x, y+size/12);
    }
}
