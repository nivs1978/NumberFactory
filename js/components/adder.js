class Adder {
    static AnchorX = 0;
    static AnchorY = 0;
    static Width = 2;
    static Height = 2;

    constructor(ctx, tileX, tileY) {
        this.ctx = ctx;
        this.tileX = tileX;
        this.tileY = tileY;
        this.beltA = null;
        this.beltB = null;
        this.beltSumOut = null;
    }

    draw(x, y, zoom, transparent = false) {
        const radius = zoom/4;
        const lineWidth = zoom * 0.05;
        const size = 2 * zoom - lineWidth;
        this.ctx.fillStyle = '#00ff00';
        if (transparent) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
        }
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = lineWidth;

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, size, size, radius);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, size, size, radius);
        this.ctx.closePath();
        this.ctx.stroke();

        // draw input A
        this.ctx.fillStyle = 'black';
        this.ctx.font = Math.round(zoom/2) + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("A", x+zoom*1.5, y+zoom*0.75);
        this.ctx.fillText("B", x+zoom*1.5, y+zoom*1.75);
        this.ctx.font = Math.round(zoom/2.5) + 'px Arial';
        this.ctx.fillText("A+B", x+zoom/2, y+zoom*1.15);
    }

    addBelt(belt) {
 //       this.belts.push(belt);
    }

    outputNumbers() {
/*        if (this.belts.length == 0) {
            return;
        }
        this.lastBeltOutputIndex = (this.lastBeltOutputIndex + 1) % this.belts.length;
        const belt = this.belts[this.lastBeltOutputIndex];
        if (belt.hasRoomForItem()){
            belt.addItem(new BeltItem(this.Number));
        }*/
    }

    getCellTypeAndComponentMatrix() {
        // create 3x3 2d array
        let componentMatrix = [];
        for (let x = 0; x < Adder.Width; x++) {
            componentMatrix[x] = [];
            for (let y = 0; y < Adder.Height; y++) {
                var cell = new Cell();
                if (x==0)
                {
                    cell.Type = CellType.ADDER_OUT;
                } else if (x == 1) {
                    if (y == 0) {
                        cell.Type = CellType.ADDER_A;
                    } else if (y == 1) {
                        cell.Type = CellType.ADDER_B;
                    }
                }
                cell.Component = this;
                componentMatrix[x][y] = cell;
            }
        }

        return componentMatrix;
    }
}