// Title: Clone Squares
// Author: Scojo
// Video: https://www.youtube.com/watch?v=1TjGatuBPcY
// Source: https://app.crackingthecryptic.com/qkrzgnhqew

// Rules encoded here:
//   Irregular Sudoku - 1-9 once each in every row, column and outlined region.
//   Clone Squares - there are three sets of clones, whose locations must be
//     determined; each clone is a 3x3 square and each set consists of three
//     clones; clones in the same set hold identical digits in exactly the same
//     positions (no rotations or reflections); clones do not overlap.
// Nothing is omitted.

const GIVENS = [
  ['R1C1', 3], ['R1C2', 8], ['R1C3', 1], ['R1C4', 6],
  ['R1C6', 4], ['R1C7', 7], ['R1C8', 2], ['R1C9', 9],
];

// The nine outlined regions, transcribed from the drawn region borders.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C1', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C2', 'R3C3', 'R4C2', 'R4C3', 'R5C2'],
  ['R2C7', 'R2C8', 'R3C7', 'R4C6', 'R4C7', 'R4C8', 'R5C6', 'R5C8', 'R6C6'],
  ['R2C9', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C5', 'R5C5', 'R6C5', 'R7C4', 'R7C5', 'R8C4'],
  ['R4C4', 'R5C3', 'R5C4', 'R6C2', 'R6C3', 'R6C4', 'R7C2', 'R8C2', 'R9C2'],
  ['R5C7', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C5', 'R8C6', 'R8C7'],
  ['R7C3', 'R8C3', 'R8C8', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
];

const geometry = cellGeometry('9x9');

// The nine clones are pairwise non-overlapping 3x3 squares, so together they
// cover 9 x 9 = 81 cells: the whole grid, exactly. R1C1 can only be the
// top-left corner of the square covering it, which therefore occupies
// R1-3C1-3; R1C4 is then the top-left corner of the next one, and repeating the
// argument along row 1 and then downwards forces the nine ordinary 3x3
// positions. Each square's cells are listed row-major, so index p names the
// same relative position in every square.
const SQUARES = cellGraph(geometry).boxes();

// One label per square, saying which of the three sets that square is in.
const setLabels = new Var('CS', 'clone set', 9);
const labels = setLabels.cells();

// The rules leave the three sets unnamed, so the labels are read in
// restricted-growth form: the first square is in set 1, and set k+1 may only be
// introduced once set k has been. That gives every way of splitting the nine
// squares into three sets exactly one labelling. The state counts how many
// squares each set holds so far; a set is full at three squares, and all three
// sets must be full at the end.
const setLabelMachine = {
  startState: { counts: [0, 0, 0] },
  transition: ({ counts }, value) => {
    if (value > 3) return undefined;                             // three sets
    if (value > 1 && counts[value - 2] === 0) return undefined;  // out of order
    if (counts[value - 1] === 3) return undefined;               // set is full
    const next = counts.slice();
    next[value - 1]++;
    return { counts: next };
  },
  accept: ({ counts }) => counts.every(count => count === 3),
};
const setLabelSpec = NFA.encodeSpec(setLabelMachine, geometry.numValues);

// Either the two squares are in different sets, or they agree cell by cell.
// Squares in different sets are left unconstrained: the rules do not require
// the three clone patterns to differ from each other.
const cloneRelations = SQUARES.flatMap((square, i) =>
  SQUARES.slice(i + 1).map((other, offset) => new Or([
    new AllDifferent(labels[i], labels[i + offset + 1]),
    new And(square.map((cell, p) => new SameValues(2, cell, other[p]))),
  ])));

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...REGIONS.map(cells => new Jigsaw('9x9', ...cells)),
  setLabels,
  new NFA(setLabelSpec, 'clone set labels', ...labels),
  ...cloneRelations,
];
