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

        let numbers = new Set();
        for (let i = 1; i < (this.DIMENSION + 1); ++i) {
            numbers.add(i);
        }

        for (let offset = 0; offset < this.CELL_COUNT; ++offset) {
            if (this.get(offset) === this.UNASSIGNED) {
                this._possibles[offset] = new Set(numbers);
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
        if (index + 1 > this._offsetCount) {
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

        this._possibles.forEach((possible, i) => {
            if (possible.size > 1) {
                this._offsets.push(i);
            }
        });
    }

    _eliminateDangling() {
        this._eliminateRowDangling();
        this._eliminateColumnDangling();
        this._eliminateBoxDangling();
    }

    _eliminateRowDangling() {
        for (let y = 0; y < this.HEIGHT; ++y) {
            let offset = y * this.DIMENSION;
            let counters = new Map();
            for (let x = 0; x < this.WIDTH; ++x) {
                this._adjustPossibleCounters(counters, offset++);
            }
            this._transferCountedEliminations(counters);
        }
    }

    _eliminateColumnDangling() {
        for (let x = 0; x < this.WIDTH; ++x) {
            let offset = x;
            let counters = new Map();
            for (let y = 0; y < this.HEIGHT; ++y) {
                this._adjustPossibleCounters(counters, offset);
                offset += this.DIMENSION;
            }
            this._transferCountedEliminations(counters);
        }
    }

    _eliminateBoxDangling() {
        for (let y = 0; y < this.HEIGHT; y += this.BOX_DIMENSION) {
            let boxStartY = y - y % this.BOX_DIMENSION;
            for (let x = 0; x < this.WIDTH; x += this.BOX_DIMENSION) {
                let counters = new Map();
                let boxStartX = x - x % this.BOX_DIMENSION;
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
        counters.forEach((counter, i) => {
            if (counter.length === 1) {
                let cell = counter[0];
                this._possibles[cell] = [i];
            }
        });
    }

    _adjustPossibleCounters(counters, offset) {
        let possibles = this._possibles[offset];
        if (possibles !== undefined) {
            possibles.forEach((possible) => {
                let counter = counters[possible];
                if (counter === undefined) {
                    counter = [];
                    counters[possible] = counter;
                }
                counter.push(offset);
            });
        }
    }

    _eliminateAssigned() {
        for (let y = 0; y < this.HEIGHT; ++y) {
            let boxY = y - y % this.BOX_DIMENSION;
            for (let x = 0; x < this.WIDTH; ++x) {
                let number = this.get(x, y);
                if (number !== this.UNASSIGNED) {
                    this._clearRowPossibles(y, number);
                    this._clearColumnPossibles(x, number);
                    let boxX = x - x % this.BOX_DIMENSION;
                    this._clearBoxPossibilities(boxX, boxY, number);
                }
            }
        }
    }

    _transferSingularPossibilities() {
        let transfer = false;
        let possibles = this._possibles;
        possibles.forEach((possible, offset) => {
            let count = possibles.size;
            if (count === 1) {
                let singular = [...possible][0]
                this.set(offset, singular);
                delete possibles[offset];
                transfer = true;
            }
        });
        return transfer;
    }

    _clearRowPossibles(y, current) {
        let offset = y * this.DIMENSION;
        for (let x = 0; x < this.WIDTH; ++x) {
            let possibles = this._possibles[offset++];
            if (possibles !== undefined) {
                delete possibles[current];
            }
        }
    }

    _clearColumnPossibles(x, current) {
        let offset = x;
        for (let y = 0; y < this.HEIGHT; ++y) {
            let possibles = this._possibles[offset];
            if (possibles !== undefined) {
                delete possibles[current];
            }
            offset += this.DIMENSION;
        }
    }

    _clearBoxPossibilities(boxStartX, boxStartY, current) {
        for (let yOffset = 0; yOffset < this.BOX_DIMENSION; ++yOffset) {
            let y = yOffset + boxStartY;
            let offset = boxStartX + y * this.DIMENSION;
            for (let xOffset = 0; xOffset < this.BOX_DIMENSION; ++xOffset) {
                let possibles = this._possibles[offset++];
                if (possibles !== undefined) {
                    delete possibles[current];
                }
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
                if (number === this.UNASSIGNED) {
                    output += '-';
                } else {
                    output += number;
                }
                output += ' ';
                if ((x + 1) % this.BOX_DIMENSION === 0 && x + 1 < width) {
                    output += '|';
                }
            }
            if ((y + 1) % this.BOX_DIMENSION === 0 && y + 1 < width) {
                output += "\n --------+---------+--------";
            }
            output += '\n';
        }
        return output;
    }
}
