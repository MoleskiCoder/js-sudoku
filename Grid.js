"use strict";

export default class Grid {

    constructor(gridWidth, gridHeight, initial) {
        this.height = gridHeight;
        this.width = gridWidth;
        this.values = initial;
    }

    get Width() {
        return this.width;
    }

    get Height() {
        return this.height;
    }

    SetViaXY(x, y, value) {
        this.Set(this.CalculateOffset(x, y), value);
    }

    Set(offset, value) {
        this.values[offset] = value;
    }

    GetViaXY(x, y) {
        return this.Get(this.CalculateOffset(x, y));
    }

    Get(offset) {
        return this.values[offset];
    }

    CalculateOffset(x, y) {
        return x + y * this.Width;
    }
}
