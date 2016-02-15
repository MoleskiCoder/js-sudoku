"use strict";

export default class Grid {

    constructor(gridWidth, gridHeight, initial) {

        if (gridWidth === undefined) {
            throw "missing argument: gridWidth";
        }
        if (typeof gridWidth !== 'number' || (gridWidth % 1 !== 0)) {
            throw "incorrect type: offset must be an integer number";
        }

        if (gridHeight === undefined) {
            throw "missing argument: gridHeight";
        }
        if (typeof gridHeight !== 'number' || (gridHeight % 1 !== 0)) {
            throw "incorrect type: gridHeight must be an integer number";
        }

        if (initial === undefined) {
            throw "missing argument: initial";
        }
        if (typeof initial !== 'object' || !Array.isArray(initial)) {
            throw "incorrect type: initial must be an array";
        }

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
        if (third === undefined) {
            this._setViaOffset(first, second);
        } else {
            this._setViaXY(first, second, third);
        }
    }

    get(first, second) {
        if (second === undefined) {
            return this._getViaOffset(first);
        }
        return this._getViaXY(first, second);
    }

    _setViaXY(x, y, value) {
        this._setViaOffset(this._calculateOffset(x, y), value);
    }

    _setViaOffset(offset, value) {

        if (offset === undefined) {
            throw "missing argument: offset";
        }
        if (typeof offset !== 'number' || (offset % 1 !== 0)) {
            throw "incorrect type: offset must be an integer number";
        }

        if (value === undefined) {
            throw "missing argument: value";
        }
        if (typeof value !== 'number' || (value % 1 !== 0)) {
            throw "incorrect type: value must be an integer number";
        }

        this._values[offset] = value;
    }

    _getViaXY(x, y) {
        return this._getViaOffset(this._calculateOffset(x, y));
    }

    _getViaOffset(offset) {

        if (offset === undefined) {
            throw "missing argument: offset";
        }
        if (typeof offset !== 'number' || (offset % 1 !== 0)) {
            throw "incorrect type: offset must be an integer number";
        }

        return this._values[offset];
    }

    _calculateOffset(x, y) {

        if (x === undefined) {
            throw "missing argument: x";
        }
        if (typeof x !== 'number' || (x % 1 !== 0)) {
            throw "incorrect type: x must be an integer number";
        }

        if (y === undefined) {
            throw "missing argument: y";
        }
        if (typeof y !== 'number' || (y % 1 !== 0)) {
            throw "incorrect type: y must be an integer number";
        }

        return x + y * this.width;
    }
}
