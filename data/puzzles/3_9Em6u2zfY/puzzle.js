// Title: Imprisoned
// Author: Agent
// Video: https://www.youtube.com/watch?v=3_9Em6u2zfY
// Source: https://app.crackingthecryptic.com/sudoku/QrH7dgjtLb

// Normal sudoku rules apply (default 9x9 rows/cols/boxes).
// "Digits cannot repeat within a cage": each of the 14 drawn cages (none
// carries a printed total) is AllDifferent.
// Outside clues: "Clues outside the grid indicate the sum total of the
// digits in the cage that contains the Nth cell from that direction, where
// N is the first digit from that direction." Read as: let cell1 be the
// grid cell nearest the clue along its row/column; if cell1 = d, then N = d
// and the cage containing the d-th cell from the border (cell1 is the 1st)
// sums to the clue value. This is encoded per clue as an Or, one branch per
// candidate digit d at cell1, each branch an And of a Given pinning cell1
// to d and a Sum of the target cage's cells to the clue value -- the same
// Given+rule-per-branch Or/And idiom used for conditional outside clues
// elsewhere (the "if flag then rule" pattern for typo'd outside clues). A
// branch is omitted when its d-th cell belongs to no cage: the clue's own
// wording presupposes a containing cage, so a digit that lands on an
// uncaged cell cannot be the one the clue describes.

// Cages, transcribed from the drawn cage outlines (cell lists, no totals).
const cageCellLists = [
  ['R1C1', 'R2C1', 'R3C1', 'R1C2', 'R1C3'],   // cage 0
  ['R4C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4'],   // cage 1
  ['R1C5', 'R1C6', 'R2C6', 'R3C6', 'R3C5'],   // cage 2
  ['R1C7', 'R2C7', 'R2C8'],                   // cage 3
  ['R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9'], // cage 4
  ['R4C7', 'R5C7', 'R6C7', 'R5C8'],           // cage 5
  ['R8C9', 'R9C9', 'R9C8'],                   // cage 6
  ['R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R8C8'], // cage 7
  ['R7C4', 'R7C5', 'R7C6', 'R8C5'],           // cage 8
  ['R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C3', 'R7C3'], // cage 9
  ['R7C1', 'R7C2', 'R8C2'],                   // cage 10
  ['R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3'],   // cage 11
  ['R6C4', 'R5C4', 'R4C4', 'R4C5', 'R4C6'],   // cage 12
  ['R5C6', 'R5C5', 'R6C5', 'R6C6'],           // cage 13
];

// Derived lookup: which cage (its full cell list) contains a given cell.
const cageOfCell = new Map();
for (const cells of cageCellLists) {
  for (const cell of cells) cageOfCell.set(cell, cells);
}

// Outside clues, transcribed from the drawn edge labels. Each lane lists
// the 9 cells of its row/column ordered from the clue inward (lane[0] is
// the cell nearest the clue).
const leftLane = row => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(row, c));
const rightLane = row => [9, 8, 7, 6, 5, 4, 3, 2, 1].map(c => makeCellId(row, c));
const topLane = col => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, col));
const bottomLane = col => [9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => makeCellId(r, col));

const outsideClues = [
  { sum: 18, lane: leftLane(1) },    // left of R1
  { sum: 20, lane: leftLane(8) },    // left of R8
  { sum: 20, lane: leftLane(9) },    // left of R9
  { sum: 35, lane: bottomLane(3) },  // bottom of C3
  { sum: 35, lane: rightLane(2) },   // right of R2
  { sum: 28, lane: topLane(5) },     // top of C5
  { sum: 22, lane: topLane(9) },     // top of C9
  { sum: 29, lane: rightLane(5) },   // right of R5
  { sum: 16, lane: bottomLane(7) },  // bottom of C7
  { sum: 26, lane: bottomLane(5) },  // bottom of C5
];

const outsideClueConstraints = outsideClues.map(({ sum, lane }) => {
  const branches = [];
  for (let d = 1; d <= 9; d++) {
    const targetCage = cageOfCell.get(lane[d - 1]);
    if (!targetCage) continue; // that d's cell has no cage; see header note.
    branches.push(new And([
      new Given(lane[0], d),
      new Sum(sum, ...targetCage),
    ]));
  }
  return new Or(branches);
});

return [
  new Shape('9x9'),
  ...cageCellLists.map(cells => new AllDifferent(...cells)),
  ...outsideClueConstraints,
];
