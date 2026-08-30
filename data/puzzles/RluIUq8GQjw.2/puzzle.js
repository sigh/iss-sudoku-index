// Title: Min-Max Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=RluIUq8GQjw
// Source: https://cracking-the-cryptic.web.app/sudoku/RmMR86trdD
//
// Standard sudoku (default row/column/box all-different) plus a Min-Max
// outside-clue rule: a clue is the sum of the lowest and highest of the
// first three digits in its row/column, counted from the clue's own end.
//
// No native class expresses "min + max of a fixed 3-cell set == target", so
// each clue is one NFA scanning its own 3 cells, carrying the running
// (min, max) seen so far and accepting when their sum equals the clue's
// value. Min/max are order-independent, so cell order within each triple
// does not affect the result; cells are still listed nearest-clue-first to
// match the rule text.
//
// Clue values transcribed from the outside-clue overlays, read clockwise
// from top-left: top C1-C9, right R1-R9, bottom C9-C1, left R9-R1.
function minMaxSpec(target) {
  return NFA.encodeSpec({
    startState: null,
    transition: (state, value) => {
      if (state === null) return { min: value, max: value };
      return { min: Math.min(state.min, value), max: Math.max(state.max, value) };
    },
    accept: (state) => state !== null && state.min + state.max === target,
  }, 9);
}

function minMaxClue(target, name, cells) {
  return new NFA(minMaxSpec(target), name, ...cells);
}

// Index 0 = column/row 1 (C1/R1) through index 8 = column/row 9 (C9/R9).
const topClues = [13, 10, 7, 9, 12, 7, 11, 11, 10];
const bottomClues = [7, 14, 11, 10, 8, 10, 11, 8, 11];
const leftClues = [5, 10, 14, 10, 12, 8, 11, 9, 10];
const rightClues = [12, 9, 8, 6, 10, 13, 7, 6, 16];

const outsideClueConstraints = [];
for (let i = 0; i < 9; i++) {
  const col = i + 1;
  outsideClueConstraints.push(
    minMaxClue(topClues[i], `top C${col}`,
      [makeCellId(1, col), makeCellId(2, col), makeCellId(3, col)]),
    minMaxClue(bottomClues[i], `bottom C${col}`,
      [makeCellId(9, col), makeCellId(8, col), makeCellId(7, col)]));

  const row = i + 1;
  outsideClueConstraints.push(
    minMaxClue(leftClues[i], `left R${row}`,
      [makeCellId(row, 1), makeCellId(row, 2), makeCellId(row, 3)]),
    minMaxClue(rightClues[i], `right R${row}`,
      [makeCellId(row, 9), makeCellId(row, 8), makeCellId(row, 7)]));
}

return [
  new Shape('9x9'),
  ...outsideClueConstraints,
];
