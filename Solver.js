"use strict";

/**
 * From: https://see.stanford.edu/materials/icspacs106b/H19-RecBacktrackExamples.pdf
 *
 */
export default class Solver {

    constructor(start) {
        this.grid = start;
        this.width = this.grid.width;
        this.height = this.grid.height;
    }

    solve() {
        this.grid._eliminate();
        return this._partialSolve(0);
    }

    /*
     * Function: _partialSolve
     * -----------------------
     * Takes a partially filled-in grid and attempts to assign values to all
     * unassigned locations in such a way to meet the requirements for sudoku
     * solution (non-duplication across rows, columns, and boxes). The function
     * operates via recursive backtracking: it finds an unassigned location with
     * the grid and then considers all digits from 1 to 9 in a loop. If a digit
     * is found that has no existing conflicts, tentatively assign it and recur
     * to attempt to fill in rest of grid. If this was successful, the puzzle is
     * solved. If not, unmake that decision and try again. If all digits have
     * been examined and none worked out, return false to backtrack to previous
     * decision point.
     */
    _partialSolve(index) {

        let offset = this.grid.getOffset(index);

        if (offset === -1) {
            return true; // success!
        }

        let numbers = this.grid.getPossibilities(offset);

        let x = offset % this.grid.DIMENSION;
        let y = offset / this.grid.DIMENSION;
        for (let number of numbers) {
            if (this._isAvailable(x, y, number)) { // if looks promising,
                this.grid.set(offset, number); // make tentative assignment
                if (this._partialSolve(index + 1)) {
                    return true; // recur, if success, yay!
                }
            }
        }
        this.grid.set(offset, this.grid.UNASSIGNED); // failure, unmake & try again
        return false; // this triggers backtracking
    }

    /*
     * Function: _isAvailable
     * ----------------------
     * Returns a boolean which indicates whether it will be legal to assign
     * number to the given row,column location. As assignment is legal if it that
     * number is not already used in the row, column, or box.
     */
    _isAvailable(x, y, number) {

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

        if (number === undefined) {
            throw "missing argument: y";
        }
        if (typeof number !== 'number' || (number % 1 !== 0)) {
            throw "incorrect type: number must be an integer number";
        }

        return !this._isUsedInRow(y, number)
            && !this._isUsedInColumn(x, number)
            && !this._isUsedInBox(x - x % this.grid.BOX_DIMENSION, y - y % this.grid.BOX_DIMENSION, number);
    }

    /*
     * Function: _isUsedInRow
     * ----------------------
     * Returns a boolean which indicates whether any assigned entry
     * in the specified row matches the given number.
     */
    _isUsedInRow(y, number) {
        let offset = y * this.grid.DIMENSION;
        for (let x = 0; x < this.width; ++x) {
            if (this.grid.get(offset++) === number) {
                return true;
            }
        }
        return false;
    }

    /*
     * Function: _isUsedInColumn
     * -------------------------
     * Returns a boolean which indicates whether any assigned entry
     * in the specified column matches the given number.
     */
    _isUsedInColumn(x, number) {
        let offset = x;
        for (let y = 0; y < this.height; ++y) {
            if (this.grid.get(offset) === number) {
                return true;
            }
            offset += this.grid.DIMENSION;
        }
        return false;
    }

    /*
     * Function: _isUsedInBox
     * ----------------------
     * Returns a boolean which indicates whether any assigned entry
     * within the specified 3x3 box matches the given number.
     */
    _isUsedInBox(boxStartX, boxStartY, number) {
        for (let yOffset = 0; yOffset < this.grid.BOX_DIMENSION; ++yOffset) {
            let y = yOffset + boxStartY;
            let offset = boxStartX + y * this.grid.DIMENSION;
            for (let xOffset = 0; xOffset < this.grid.BOX_DIMENSION; ++xOffset) {
                if (this.grid.get(offset++) === number) {
                    return true;
                }
            }
        }
        return false;
    }
}
