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
