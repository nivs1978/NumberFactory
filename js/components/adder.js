class Adder {
    static AnchorX = 0;
    static AnchorY = 0;
    static Width = 2;
    static Height = 2;

    constructor(ctx, tileX, tileY, rotation = ComponentRotation.RIGHT) {
        this.ctx = ctx;
        this.tileX = tileX;
        this.tileY = tileY;
        this.rotation = rotation;
        this.beltA = null;
        this.beltB = null;
        this.beltSumOut = null;
        this.valueA = 0;
        this.valueB = 0;
        this.valueSum = 0;
        this.addInterval = 4;
        this.highlighted = false;
        this.numberTimer = setInterval(() => this.outputNumbers(), 4000);
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

        // draw input A and B based on rotation
        this.ctx.fillStyle = 'black';
        this.ctx.font = Math.round(zoom/2) + 'px Arial';
        this.ctx.textAlign = 'center';

        switch (this.rotation) {
            case ComponentRotation.RIGHT:
                this.ctx.fillText("A", x+zoom*1.5, y+zoom*0.75);
                this.ctx.fillText("B", x+zoom*1.5, y+zoom*1.6);
                this.ctx.font = Math.round(zoom/2.5) + 'px Arial';
                this.ctx.fillText("A+B", x+zoom/2, y+zoom*1.15);
                break;
            case ComponentRotation.DOWN:
                this.ctx.fillText("B", x+zoom*0.5, y+zoom*1.6);
                this.ctx.fillText("A", x+zoom*1.5, y+zoom*1.6);
                this.ctx.font = Math.round(zoom/2.5) + 'px Arial';
                this.ctx.fillText("A+B", x+zoom, y+zoom*0.7);
                break;
            case ComponentRotation.LEFT:
                this.ctx.fillText("B", x+zoom*0.5, y+zoom*0.75);
                this.ctx.fillText("A", x+zoom*0.5, y+zoom*1.6);
                this.ctx.font = Math.round(zoom/2.5) + 'px Arial';
                this.ctx.fillText("A+B", x+zoom*1.45, y+zoom*1.15);
                break;
            case ComponentRotation.UP:
                this.ctx.fillText("A", x+zoom*0.5, y+zoom*0.75);
                this.ctx.fillText("B", x+zoom*1.5, y+zoom*0.75);
                this.ctx.font = Math.round(zoom/2.5) + 'px Arial';
                this.ctx.fillText("A+B", x+zoom, y+zoom*1.55);
                break;
        }

    }

    canAddBelt(cellType) {
        switch (cellType) {
            case CellType.ADDER_A:
                return this.beltA == null;
            case CellType.ADDER_B:
                return this.beltB == null;
            case CellType.ADDER_OUT:
                return this.beltSumOut == null;
        }
        return false;
    }

    setBelt(belt, cellType) {
        switch (cellType) {
            case CellType.ADDER_A:
                this.beltA = belt;
                break;
            case CellType.ADDER_B:
                this.beltB = belt;
                break;
            case CellType.ADDER_OUT:
                this.beltSumOut = belt;
                break;
        }
    }

    addBeltItemIfPossible(sourceBelt, beltItem) {
        if (sourceBelt == this.beltA && this.valueA == 0) {
            this.valueA = beltItem.number;
            return true;
        } else if (sourceBelt == this.beltB && this.valueB == 0) {
            this.valueB = beltItem.number;
            return true;
        }
        return false;
    }

    outputNumbers() {
        if (this.valueSum && this.beltSumOut) {
            if (this.beltSumOut.hasRoomForItem()) {
                this.beltSumOut.addItem(new BeltItem(this.valueSum));
            this.valueSum = 0;
            } 
        }
        if (this.valueA != 0 && this.valueB != 0 && this.valueSum == 0) {
            this.valueSum = this.valueA + this.valueB;
            this.valueA = 0;
            this.valueB = 0;
        }
    }

    getCellTypeAndComponentMatrix() {
        // create 3x3 2d array
        let componentMatrix = [];
        for (let x = 0; x < Adder.Width; x++) {
            componentMatrix[x] = [];
            for (let y = 0; y < Adder.Height; y++) {
                var cell = new Cell();
                switch (this.rotation) {
                    case ComponentRotation.RIGHT:
                        if (x == 0) {
                            cell.Type = CellType.ADDER_OUT;
                        } else if (x == 1) {
                            if (y == 0) {
                                cell.Type = CellType.ADDER_A;
                            } else if (y == 1) {
                                cell.Type = CellType.ADDER_B;
                            }
                        }
                        break;
                    case ComponentRotation.DOWN:
                        if (y == 0) {
                            cell.Type = CellType.ADDER_OUT;
                        } else if (y == 1) {
                            if (x == 0) {
                                cell.Type = CellType.ADDER_B;
                            } else if (x == 1) {
                                cell.Type = CellType.ADDER_A;
                            }
                        }
                        break;
                    case ComponentRotation.LEFT:
                        if (x == 1) {
                            cell.Type = CellType.ADDER_OUT;
                        } else if (x == 0) {
                            if (y == 0) {
                                cell.Type = CellType.ADDER_B;
                            } else if (y == 1) {
                                cell.Type = CellType.ADDER_A;
                            }
                        }
                        break;
                    case ComponentRotation.UP:
                        if (y == 1) {
                            cell.Type = CellType.ADDER_OUT;
                        } else if (y == 0) {
                            if (x == 0) {
                                cell.Type = CellType.ADDER_A;
                            } else if (x == 1) {
                                cell.Type = CellType.ADDER_B;
                            }
                        }
                        break;
                }
                cell.Component = this;
                componentMatrix[x][y] = cell;
            }
        }

        return componentMatrix;
    }

    removeBelt(belt){
        if (this.beltA == belt) {
            this.beltA = null;
        }
        if (this.beltB == belt) {
            this.beltB = null;
        }
        if (this.beltSumOut == belt) {
            this.beltSumOut = null;
        }
    }

    destroy() {
        clearInterval(this.numberTimer);
        this.numberTimer = null;
        if (this.beltA) {
            this.beltA.next = null;
            this.beltA = null;
        }
        if (this.beltB) {
            this.beltB.next = null;
            this.beltB = null;
        }
        if (this.beltSumOut) {
            this.beltSumOut.prev = null;
            this.beltSumOut = null;
        }
    }   
}