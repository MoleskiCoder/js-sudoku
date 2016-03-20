'use strict';

import SudokuGrid from './SudokuGrid';

/**
 * From: https://see.stanford.edu/materials/icspacs106b/H19-RecBacktrackExamples.pdf
 *
 */
export default class Solver {

  constructor(start) {
    this._grid = start;
    this._width = this._grid.width;
    this._height = this._grid.height;

    this._recursed = 0;
    this._looped = 0;
  }

  solve() {
    this._grid._eliminate();
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

    ++this._recursed;

    let offset = this._grid.getOffset(index);

    if (offset === -1) {
      return true; // Success!
    }

    let numbers = this._grid.getPossibilities(offset);

    let x = offset % this._grid.DIMENSION;
    let y = Math.floor(offset / this._grid.DIMENSION);
    for (let check of numbers) {
      if (check === undefined) {
        continue;
      }

      ++this._looped;
      if (this._isAvailable(x, y, check)) { // If looks promising,
        this._grid.set(offset, check); // Make tentative assignment
        if (this._partialSolve(index + 1)) {
          return true; // Recur, if success, yay!
        }
      }
    }
    this._grid.set(offset, this._grid.UNASSIGNED); // Failure, unmake & try again
    return false; // This triggers backtracking
  }

  /*
   * Function: _isAvailable
   * ----------------------
   * Returns a boolean which indicates whether it will be legal to assign
   * number to the given row,column location. As assignment is legal if it that
   * number is not already used in the row, column, or box.
   */
  _isAvailable(x, y, check) {
    return !this._isUsedInRow(y, check) &&
           !this._isUsedInColumn(x, check) &&
           !this._isUsedInBox(x - x % this._grid.BOX_DIMENSION, y - y % this._grid.BOX_DIMENSION, check);
  }

  /*
  * Function: _isUsedInRow
  * ----------------------
  * Returns a boolean which indicates whether any assigned entry
  * in the specified row matches the given number.
  */
  _isUsedInRow(y, check) {
    let offset = y * this._grid.DIMENSION;
    for (let x = 0; x < this._width; ++x) {
      if (this._grid.get(offset++) === check) {
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
  _isUsedInColumn(x, check) {
    let offset = x;
    for (let y = 0; y < this._height; ++y) {
      if (this._grid.get(offset) === check) {
        return true;
      }
      offset += this._grid.DIMENSION;
    }
    return false;
  }

  /*
  * Function: _isUsedInBox
  * ----------------------
  * Returns a boolean which indicates whether any assigned entry
  * within the specified 3x3 box matches the given number.
  */
  _isUsedInBox(boxStartX, boxStartY, check) {
    for (let yOffset = 0; yOffset < this._grid.BOX_DIMENSION; ++yOffset) {
      let y = yOffset + boxStartY;
      let offset = boxStartX + y * this._grid.DIMENSION;
      for (let xOffset = 0; xOffset < this._grid.BOX_DIMENSION; ++xOffset) {
        if (this._grid.get(offset++) === check) {
          return true;
        }
      }
    }
    return false;
  }
}
