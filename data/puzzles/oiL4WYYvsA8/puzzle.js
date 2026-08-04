// Title: Shifted X-sums 2
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=oiL4WYYvsA8
// Source: https://app.crackingthecryptic.com/sudoku/qT97tJ8q8p

// Normal sudoku rules apply (standard 9 boxes; default row/column/box
// all-different is used unmodified).
//
// Outside clue rule (metadata.rules): for the row/column the clue faces,
// let N be the digit in the 1st cell from that side, and let X be the digit
// in the Nth cell from that side. The clue equals the sum of the X cells
// starting at (and including) that Nth cell, continuing further from that
// side. Example given in the rules: row 514839762 gives a left clue of 19
// (N=5 -> 5th cell from left is 3 -> 3+9+7) and a right clue of 37 (N=2 ->
// 2nd cell from right is 6 -> 6+7+9+3+8+4).
//
// Encoded as one NFA per outside clue, scanning that lane's 9 cells in order
// from the clue's side. State machine: read the 1st cell as N and count down
// to the Nth cell; read that cell's value as X and the first sum term; sum
// the next X-1 cells; accept iff the accumulated sum equals the clue and
// exactly 9 cells were consumed (cells after the summed window are consumed
// but do not affect the outcome, matching "sum of the first X digits from
// the Nth cell" with no constraint on what follows).
function shiftedXSumSpec(target) {
  return NFA.encodeSpec({
    startState: { tag: 'start' },
    transition: (state, value) => {
      switch (state.tag) {
        case 'start': {
          // value is N: the anchor read from the 1st cell of the lane.
          const skip = value - 1;
          if (skip === 0) {
            // N === 1, so the Nth cell is this same cell: X === N === value.
            const sum = value;
            const left = value - 1;
            if (left === 0) return { tag: sum === target ? 'ok' : 'bad' };
            return { tag: 'sum', left, sum };
          }
          return { tag: 'seek', skip };
        }
        case 'seek': {
          const skip = state.skip - 1;
          if (skip === 0) {
            // Reached the Nth cell: value is X, and also the first sum term.
            const sum = value;
            const left = value - 1;
            if (left === 0) return { tag: sum === target ? 'ok' : 'bad' };
            return { tag: 'sum', left, sum };
          }
          return { tag: 'seek', skip };
        }
        case 'sum': {
          const sum = state.sum + value;
          const left = state.left - 1;
          if (left === 0) return { tag: sum === target ? 'ok' : 'bad' };
          return { tag: 'sum', left, sum };
        }
        // Window already closed; remaining lane cells don't change the verdict.
        case 'ok': return { tag: 'ok' };
        case 'bad': return { tag: 'bad' };
      }
    },
    accept: (state) => state.tag === 'ok',
    maxDepth: 9,
  }, 9);
}

// Lane cells in order away from the named side (position 1 = nearest the
// clue), 1-indexed row/col via makeCellId.
function laneCells(side, index) {
  switch (side) {
    case 'left': return Array.from({ length: 9 }, (_, i) => makeCellId(index, i + 1));
    case 'right': return Array.from({ length: 9 }, (_, i) => makeCellId(index, 9 - i));
    case 'top': return Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, index));
    case 'bottom': return Array.from({ length: 9 }, (_, i) => makeCellId(9 - i, index));
  }
}

// Outside clues, transcribed from the drawn text overlays just off the grid
// edge: left of R1/R4/R5/R6/R9, right of R7, top of C1/C3/C5, bottom of
// C4/C7.
const outsideClues = [
  { side: 'left', index: 1, clue: 40 },
  { side: 'left', index: 4, clue: 9 },
  { side: 'left', index: 5, clue: 8 },
  { side: 'left', index: 6, clue: 33 },
  { side: 'left', index: 9, clue: 10 },
  { side: 'right', index: 7, clue: 1 },
  { side: 'top', index: 1, clue: 11 },
  { side: 'top', index: 3, clue: 11 },
  { side: 'top', index: 5, clue: 10 },
  { side: 'bottom', index: 4, clue: 19 },
  { side: 'bottom', index: 7, clue: 25 },
];

const shiftedXSumConstraints = outsideClues.map(
  ({ side, index, clue }) =>
    new NFA(shiftedXSumSpec(clue), 'ShiftedXSum', ...laneCells(side, index)));

return [
  new Shape('9x9'),
  ...shiftedXSumConstraints,
];
