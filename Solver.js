"use strict";

/**
 * From: https://see.stanford.edu/materials/icspacs106b/H19-RecBacktrackExamples.pdf
 *
 */
export default class Solver {

    constructor(start) {
        this.grid = start;
        this.width = this.grid.Width;
        this.height = this.grid.Height;
    }

    Solve() {
        this.grid.Eliminate();
        return this.PartialSolve(0);
    }

    /*
     * Function: PartialSolve
     * ----------------------
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
    PartialSolve(index) {

        let offset = this.grid.GetOffset(index);

        if (offset == -1) {
            return true; // success!
        }

        let numbers = this.grid.GetPossibilities(offset);

        let x = offset % this.grid.DIMENSION;
        let y = offset / this.grid.DIMENSION;
        for (let number of numbers) {
            if (this.IsAvailable(x, y, number)) { // if looks promising,
                this.grid.Set(offset, number); // make tentative assignment
                if (this.Solve(index + 1)) {
                    return true; // recur, if success, yay!
                }
            }
        }
        this.grid.Set(offset, this.grid.UNASSIGNED); // failure, unmake & try again
        return false; // this triggers backtracking
    }

    /*
     * Function: IsAvailable
     * ---------------------
     * Returns a boolean which indicates whether it will be legal to assign
     * number to the given row,column location. As assignment is legal if it that
     * number is not already used in the row, column, or box.
     */
    IsAvailable(x, y, number) {
        return !this.IsUsedInRow(y, number)
            && !this.IsUsedInColumn(x, number)
            && !this.IsUsedInBox(x - x % this.grid.BOX_DIMENSION, y - y % SudokuGrid.BOX_DIMENSION, number);
    }

    /*
     * Function: IsUsedInRow
     * ---------------------
     * Returns a boolean which indicates whether any assigned entry
     * in the specified row matches the given number.
     */
    IsUsedInRow(y, number) {
        let offset = y * this.grid.DIMENSION;
        for (let x = 0; x < this.width; ++x) {
            if (this.grid.Get(offset++) == number) {
                return true;
            }
        }
        return false;
    }

    /*
     * Function: IsUsedInColumn
     * ------------------------
     * Returns a boolean which indicates whether any assigned entry
     * in the specified column matches the given number.
     */
    IsUsedInColumn(x, number) {
        let offset = x;
        for (let y = 0; y < this.height; ++y) {
            if (this.grid.Get(offset) == number) {
                return true;
            }
            offset += this.grid.DIMENSION;
        }
        return false;
    }

    /*
     * Function: IsUsedInBox
     * ---------------------
     * Returns a boolean which indicates whether any assigned entry
     * within the specified 3x3 box matches the given number.
     */
    IsUsedInBox(boxStartX, boxStartY, number) {
        for (let yOffset = 0; yOffset < this.grid.BOX_DIMENSION; ++yOffset) {
            let y = yOffset + boxStartY;
            let offset = boxStartX + y * this.grid.DIMENSION;
            for (let xOffset = 0; xOffset < this.grid.BOX_DIMENSION; ++xOffset) {
                if (this.grid.Get(offset++) == number) {
                    return true;
                }
            }
        }
        return false;
    }
}
