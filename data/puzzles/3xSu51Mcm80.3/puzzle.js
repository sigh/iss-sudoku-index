// Title: Wanna Be Starting Sumthing
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=3xSu51Mcm80
// Source: https://tinyurl.com/yejtp3m3

// Normal sudoku rules apply. Each outside clue gives the sum of either the
// first-and-second or the second-and-third cell seen from that clue's
// direction. A position carrying two stacked numbers fixes both pair-sums,
// but not which printed number belongs to which pair -- the rules' own
// worked example accepts both orderings for a "3, 10" clue.

// One outside-sum constraint. A single value leaves the unnamed pair free
// (Or of the two possible pair-sums); two values fix both pair-sums but not
// their assignment to the two printed numbers (Or of the two orderings).
const outsideSum = (values, c1, c2, c3) => {
  if (values.length === 1) {
    const [v] = values;
    return new Or([new Sum(v, c1, c2), new Sum(v, c2, c3)]);
  }
  const [v1, v2] = values;
  return new Or([
    new And([new Sum(v1, c1, c2), new Sum(v2, c2, c3)]),
    new And([new Sum(v2, c1, c2), new Sum(v1, c2, c3)]),
  ]);
};

// Outside clue values by side and row/column, as drawn one cell outside each
// grid edge (interior rows/columns are 1-9).
const topClues = { // above row 1, reading down R1,R2,R3 of that column
  1: [3, 10],
  3: [11, 12],
  6: [9],
  7: [5],
  9: [13],
};
const bottomClues = { // below row 9, reading up R9,R8,R7 of that column
  1: [15],
  3: [5],
  4: [14],
  7: [7, 10],
  9: [9, 16],
};
const leftClues = { // left of column 1, reading right C1,C2,C3 of that row
  1: [4, 10],
  3: [10, 12],
  4: [13],
  7: [11],
  9: [13],
};
const rightClues = { // right of column 9, reading left C9,C8,C7 of that row
  1: [6],
  3: [14],
  6: [14],
  7: [7, 9],
  9: [9, 17],
};

const outsideClueConstraints = [
  ...Object.entries(topClues).map(([c, values]) =>
    outsideSum(values,
      makeCellId(1, +c), makeCellId(2, +c), makeCellId(3, +c))),
  ...Object.entries(bottomClues).map(([c, values]) =>
    outsideSum(values,
      makeCellId(9, +c), makeCellId(8, +c), makeCellId(7, +c))),
  ...Object.entries(leftClues).map(([r, values]) =>
    outsideSum(values,
      makeCellId(+r, 1), makeCellId(+r, 2), makeCellId(+r, 3))),
  ...Object.entries(rightClues).map(([r, values]) =>
    outsideSum(values,
      makeCellId(+r, 9), makeCellId(+r, 8), makeCellId(+r, 7))),
];

return [
  new Shape('9x9'),
  new Given('R2C8', 1),
  new Given('R4C5', 8),
  new Given('R5C4', 1),
  new Given('R5C6', 5),
  new Given('R6C5', 7),
  new Given('R8C2', 5),
  ...outsideClueConstraints,
];
