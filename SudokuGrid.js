"use strict";

import Grid from './Grid';

export default class SudokuGrid extends Grid {

    constructor(initial) {

        let dimension = 9;
        let cellCount = dimension * dimension;
        let unassigned = 0;

        super(dimension, dimension, initial);

        this.UNASSIGNED = unassigned;
        this.DIMENSION = dimension;
        this.CELL_COUNT = cellCount;
        this.WIDTH = dimension;
        this.HEIGHT = dimension;
        this.BOX_DIMENSION = 3;

        this.possibles = [];
        this.offsets = [];

        let numbers = new Set;
        for (let i = 1; i < this.DIMENSION + 1; ++i) {
            numbers.add(i);
        }

        for (let offset = 0; offset < this.CELL_COUNT; ++offset) {
            if (this.Get(offset) == this.UNASSIGNED) {
                this.possibles.push(new Set(numbers));
            } else {
                this.possibles.push(new Set);
            }
        }
    }

    GetPossibilities(offset) {
        return this.possibles[offset];
    }

    GetOffset(index) {
        if (index + 1 > this.GetOffsetCount()) {
            return -1;
        }
        return this.offsets[index];
    }

    GetOffsetCount() {
        return this.offsets.length;
    }

    Eliminate() {
        do {
            this.EliminateAssigned();
            this.EliminateDangling();
        } while (this.TransferSingularPossibilities());

        for (let i = 0; i < this.CELL_COUNT; ++i) {
            let possible = this.possibles[i];
            if (possible.length > 1) {
                this.offsets.push(i);
            }
        }
    }

    EliminateDangling() {
        this.EliminateRowDangling();
        this.EliminateColumnDangling();
        this.EliminateBoxDangling();
    }

    EliminateRowDangling() {
        for (let y = 0; y < this.HEIGHT; ++y) {
            let offset = y * this.DIMENSION;
            let counters = new Map;
            for (let x = 0; x < this.WIDTH; ++x) {
                this.AdjustPossibleCounters(counters, offset++);
            }
            this.TransferCountedEliminations(counters);
        }
    }

    EliminateColumnDangling() {
        for (let x = 0; x < this.WIDTH; ++x) {
            let offset = x;
            let counters = new Map;
            for (let y = 0; y < this.HEIGHT; ++y) {
                this.AdjustPossibleCounters(counters, offset);
                offset += this.DIMENSION;
            }
            this.TransferCountedEliminations(counters);
        }
    }

    EliminateBoxDangling() {
        for (let y = 0; y < this.HEIGHT; y += this.BOX_DIMENSION) {
            for (let x = 0; x < this.WIDTH; x += this.BOX_DIMENSION) {
            let counters = new Map;

                let boxStartX = x - x % this.BOX_DIMENSION;
                let boxStartY = y - y % this.BOX_DIMENSION;

                for (let yOffset = 0; yOffset < this.BOX_DIMENSION; ++yOffset) {
                    let boxY = yOffset + boxStartY;
                    let offset = boxStartX + boxY * this.DIMENSION;
                    for (let xOffset = 0; xOffset < this.BOX_DIMENSION; ++xOffset) {
                        this.AdjustPossibleCounters(counters, offset++);
                    }
                }
                this.TransferCountedEliminations(counters);
            }
        }
    }

    TransferCountedEliminations(counters) {
        let numbers = Object.keys(counters);
        for (let number in numbers) {
            let cells = counters[key];
            if (cells.length == 1) {
                let cell = cells[0];
                this.possibles[cell] = [ number ];
            }
        }
    }

    AdjustPossibleCounters(counters, offset) {
        for (let possible of this.possibles[offset]) {
            let counter = counters.get(possible);
            if (counter == undefined) {
                counter = [];
                counters.set(possible, counter);
            }
            counter.push(offset);
        }
    }

    EliminateAssigned() {
        for (let y = 0; y < this.HEIGHT; ++y) {
            for (let x = 0; x < this.WIDTH; ++x) {
                let number = this.Get(x, y);
                if (number != this.UNASSIGNED) {
                    this.ClearRowPossibles(y, number);
                    this.ClearColumnPossibles(x, number);
                    this.ClearBoxPossibilities(x - x % this.BOX_DIMENSION, y - y % this.BOX_DIMENSION, number);
                }
            }
        }
    }

    TransferSingularPossibilities() {
        let transfer = false;
        for (let offset = 0; offset < this.CELL_COUNT; ++offset) {
            let possible = this.possibles[offset];
            let keys = Object.keys(possible);
            if (keys.length == 1) {
                let first = keys[0];
                let singular = possible[first];
                this.Set(offset, singular);
                delete possible[first];
                transfer = true;
            }
        }
        return transfer;
    }

    ClearRowPossibles(y, number) {
        let offset = y * this.DIMENSION;
        for (let x = 0; x < this.WIDTH; ++x) {
            let possible = this.possibles[offset];
            possible.delete(number);
            offset++;
        }
    }

    ClearColumnPossibles(x, number) {
        let offset = x;
        for (let y = 0; y < this.HEIGHT; ++y) {
            let possible = this.possibles[offset];
            possible.delete(number);
            offset += this.DIMENSION;
        }
    }

    ClearBoxPossibilities(boxStartX, boxStartY, number) {
        for (let yOffset = 0; yOffset < this.BOX_DIMENSION; ++yOffset) {
            let y = yOffset + boxStartY;
            let offset = boxStartX + y * this.DIMENSION;
            for (let xOffset = 0; xOffset < this.BOX_DIMENSION; ++xOffset) {
                let possible = this.possibles[offset];
                possible.delete(number);
                offset++;
            }
        }
    }

    ToString() {
        let output = '\n';
        let height = this.Height;
        for (let y = 0; y < height; ++y) {
            let width = this.Width;
            for (let x = 0; x < width; ++x) {
                let number = this.GetViaXY(x, y);
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
