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
        this.ctx.fillText(this.Level, x, y - size / 4);

        // draw count and target count as x/y in the center
        this.ctx.fillStyle = 'lightgreen';
        this.ctx.font = Math.round(zoom) + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.Count + '/' + this.TargetCount, x, y);
    }
}
