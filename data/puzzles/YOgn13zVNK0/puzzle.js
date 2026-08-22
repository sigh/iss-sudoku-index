// Title: Cheeky Debugger
// Author: PrimeWeasel
// Video: https://www.youtube.com/watch?v=YOgn13zVNK0
// Source: https://app.crackingthecryptic.com/sudoku/N87266GQRD

// Normal Sudoku rules apply. Grey squares are even, grey circles are odd.
//
// "For every digit X in a cell in box Y, there is a digit Y in the same
// position in box X": for a fixed position P and a box pair b != c, applying
// the rule once to the box-b cell and once to the box-c cell yields the same
// pair of facts, so it collapses to a single iff per unordered box pair per
// position: value(box b, pos P) == c  <=>  value(box c, pos P) == b. The
// b == c case is a tautology (it names the cell itself) and adds nothing.

const oddCells = [
  'R2C1', 'R2C6', 'R3C8', 'R2C9', 'R6C8', 'R8C9', 'R8C7', 'R8C6', 'R8C4',
  'R9C2', 'R5C1', 'R6C2', 'R5C3', 'R5C4', 'R6C5',
];
const evenCells = [
  'R1C1', 'R1C7', 'R1C8', 'R3C6', 'R4C5', 'R4C4', 'R4C2', 'R5C9', 'R7C8',
  'R7C7',
];

// boxes()[b][p] is the cell at position p (row-major, 0-indexed) within box
// b+1 (reading order, 1-indexed) -- the standard box numbering the rule's
// "box Y"/"box X" refers to.
const boxes = cellGraph('9x9').boxes();

const boxLinks = [];
for (let p = 0; p < 9; p++) {
  for (let b = 0; b < 9; b++) {
    for (let c = b + 1; c < 9; c++) {
      const key = Pair.fnToKey((x, y) => (x === c + 1) === (y === b + 1), 9);
      boxLinks.push(
        new Pair(key, 'box position swap', boxes[b][p], boxes[c][p]));
    }
  }
}

return [
  new Shape('9x9'),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...boxLinks,
];
