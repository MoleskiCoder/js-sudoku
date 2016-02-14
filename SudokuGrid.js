"use strict";

import Grid from './Grid';

export default class SudokuGrid extends Grid {

    constructor(initial) {

        let dimension = 9;
        let cellCount = dimension * dimension;
        let unassigned = 0;

        super(dimension, dimension, initial);

        this._UNASSIGNED = unassigned;
        this._DIMENSION = dimension;
        this._CELL_COUNT = cellCount;
        this._WIDTH = dimension;
        this._HEIGHT = dimension;
        this._BOX_DIMENSION = 3;

        this._possibles = [];
        this._offsets = [];

        let numbers = new Set;
        for (let i = 1; i < (this.DIMENSION + 1); ++i) {
            numbers.add(i);
        }

        for (let offset = 0; offset < this.CELL_COUNT; ++offset) {
            if (this.get(offset) == this.UNASSIGNED) {
                this._possibles.push(new Set(numbers));
            } else {
                this._possibles.push(new Set);
            }
        }
    }

    get UNASSIGNED() {
        return this._UNASSIGNED;
    }

    get DIMENSION() {
        return this._DIMENSION;
    }

    get CELL_COUNT() {
        return this._CELL_COUNT;
    }

    get WIDTH() {
        return this._WIDTH;
    }

    get HEIGHT() {
        return this._HEIGHT;
    }

    get BOX_DIMENSION() {
        return this._BOX_DIMENSION;
    }

    getPossibilities(offset) {
        return this._possibles[offset];
    }

    getOffset(index) {
        if (index + 1 > this.OffsetCount) {
            return -1;
        }
        return this._offsets[index];
    }

    get _offsetCount() {
        return this._offsets.length;
    }

    _eliminate() {
        do {
            this._eliminateAssigned();
            this._eliminateDangling();
        } while (this._transferSingularPossibilities());

        for (let i = 0; i < this.CELL_COUNT; ++i) {
            let possible = this._possibles[i];
            if (possible.length > 1) {
                this._offsets.push(i);
            }
        }
    }

    _eliminateDangling() {
        this._eliminateRowDangling();
        this._eliminateColumnDangling();
        this._eliminateBoxDangling();
    }

    _eliminateRowDangling() {
        for (let y = 0; y < this.HEIGHT; ++y) {
            let offset = y * this.DIMENSION;
            let counters = new Map;
            for (let x = 0; x < this.WIDTH; ++x) {
                this._adjustPossibleCounters(counters, offset++);
            }
           this._transferCountedEliminations(counters);
        }
    }

    _eliminateColumnDangling() {
        for (let x = 0; x < this.WIDTH; ++x) {
            let offset = x;
            let counters = new Map;
            for (let y = 0; y < this.HEIGHT; ++y) {
                this._adjustPossibleCounters(counters, offset);
                offset += this.DIMENSION;
            }
            this._transferCountedEliminations(counters);
        }
    }

    _eliminateBoxDangling() {
        for (let y = 0; y < this.HEIGHT; y += this.BOX_DIMENSION) {
            for (let x = 0; x < this.WIDTH; x += this.BOX_DIMENSION) {
            let counters = new Map;

                let boxStartX = x - x % this.BOX_DIMENSION;
                let boxStartY = y - y % this.BOX_DIMENSION;

                for (let yOffset = 0; yOffset < this.BOX_DIMENSION; ++yOffset) {
                    let boxY = yOffset + boxStartY;
                    let offset = boxStartX + boxY * this.DIMENSION;
                    for (let xOffset = 0; xOffset < this.BOX_DIMENSION; ++xOffset) {
                        this._adjustPossibleCounters(counters, offset++);
                    }
                }
                this._transferCountedEliminations(counters);
            }
        }
    }

    _transferCountedEliminations(counters) {
        for (let [number, cells] in counters) {
            let cells = counters[key];
            if (cells.length == 1) {
                let cell = cells[0];
                this._possibles[cell] = [ number ];
            }
        }
    }

    _adjustPossibleCounters(counters, offset) {
        for (let possible of this._possibles[offset]) {
            let counter = counters.get(possible);
            if (counter == undefined) {
                counter = [];
                counters.set(possible, counter);
            }
            counter.push(offset);
        }
    }

    _eliminateAssigned() {
        for (let y = 0; y < this.HEIGHT; ++y) {
            for (let x = 0; x < this.WIDTH; ++x) {
                let number = this.get(x, y);
                if (number != this.UNASSIGNED) {
                    this._clearRowPossibles(y, number);
                    this._clearColumnPossibles(x, number);
                    this._clearBoxPossibilities(x - x % this.BOX_DIMENSION, y - y % this.BOX_DIMENSION, number);
                }
            }
        }
    }

    _transferSingularPossibilities() {
        let transfer = false;
        for (let offset = 0; offset < this.CELL_COUNT; ++offset) {
            let possible = this._possibles[offset];
            let keys = Object.keys(possible);
            if (keys.length == 1) {
                let first = keys[0];
                let singular = possible[first];
                this.set(offset, singular);
                delete possible[first];
                transfer = true;
            }
        }
        return transfer;
    }

    _clearRowPossibles(y, number) {
        let offset = y * this.DIMENSION;
        for (let x = 0; x < this.WIDTH; ++x) {
            this._possibles[offset].delete(number);
            offset++;
        }
    }

    _clearColumnPossibles(x, number) {
        let offset = x;
        for (let y = 0; y < this.HEIGHT; ++y) {
            this._possibles[offset].delete(number);
            offset += this.DIMENSION;
        }
    }

    _clearBoxPossibilities(boxStartX, boxStartY, number) {
        for (let yOffset = 0; yOffset < this.BOX_DIMENSION; ++yOffset) {
            let y = yOffset + boxStartY;
            let offset = boxStartX + y * this.DIMENSION;
            for (let xOffset = 0; xOffset < this.BOX_DIMENSION; ++xOffset) {
                this._possibles[offset].delete(number);
                offset++;
            }
        }
    }

    toString() {
        let output = '\n';
        let height = this.height;
        for (let y = 0; y < height; ++y) {
            let width = this.width;
            for (let x = 0; x < width; ++x) {
                let number = this.get(x, y);
                output += ' ';
                if (number == this.UNASSIGNED) {
                    output += '-';
                } else {
                    output += number;
                }
                output += ' ';
                if ((x + 1) % this.BOX_DIMENSION == 0 && x + 1 < width) {
                    output += '|';
                }
            }
            if ((y + 1) % this.BOX_DIMENSION == 0 && y + 1 < width) {
                output += "\n --------+---------+--------";
            }
            output += '\n';
        }
        return output;
    }
}
