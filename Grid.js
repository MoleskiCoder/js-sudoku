"use strict";

export default class Grid {

    constructor(gridWidth, gridHeight, initial) {
        this._height = gridHeight;
        this._width = gridWidth;
        this._values = initial;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    set(first, second, third) {
        if (third == undefined) {
            this._setViaOffset(first, second);
        } else {
            this._setViaXY(first, second, third);
        }
    }

    get(first, second) {
        if (second == undefined) {
            return this._getViaOffset(first);
        }
        return this._getViaXY(first, second);
    }

    _setViaXY(x, y, value) {
        this._setViaOffset(this._calculateOffset(x, y), value);
    }

    _setViaOffset(offset, value) {
        this._values[offset] = value;
    }

    _getViaXY(x, y) {
        return this._getViaOffset(this._calculateOffset(x, y));
    }

    _getViaOffset(offset) {
        return this._values[offset];
    }

    _calculateOffset(x, y) {
        return x + y * this.width;
    }
}
