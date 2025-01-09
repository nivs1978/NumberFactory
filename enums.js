const DrawStartDirectionType = Object.freeze({
    HORIZONTAL: 0,
    VERTICAL: 1
});

const CellType = Object.freeze({
    EMPTY: 0,
    NUMBER: 1,
    NUMBERBUFFER: 2,
    CONVEYER: 3,
    TARGET: 4
});

const DrawModeType = Object.freeze({
    NONE: 0,
    CONVEYER: 1,
    EXTRACTOR: 2,
    DEMOLISHER: 3,
    ADDER: 4,
    SUBTRACTOR: 5,
    MULTIPLIER: 6,
    DIVIDER: 7
});