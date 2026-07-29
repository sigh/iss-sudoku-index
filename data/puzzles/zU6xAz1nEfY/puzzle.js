// Title: Quadrarrows
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=zU6xAz1nEfY
// Source: https://sudokupad.app/51lxch73sn

// Standard 9x9 Sudoku. Each arrow sum must be a digit in the four cells around
// its connected circle. Equal sums from different arrows on one circle require
// distinct surrounding cells, so the arrow-sum multiset is contained in the
// circle's 2x2 digit multiset.
//
// The tables transcribe the grey routes and circle overlays. Each circle is
// named by the top-left cell of its surrounding 2x2 group; an arm is one route
// from that circle to an arrowhead.
const quadrarrows = [
  {
    circle: ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
    arms: [['R1C2'], ['R2C3', 'R3C4', 'R3C5']],
  },
  {
    circle: ['R1C7', 'R1C8', 'R2C7', 'R2C8'],
    arms: [['R1C4', 'R2C5', 'R1C6', 'R1C7'], ['R2C8', 'R3C8']],
  },
  {
    circle: ['R5C7', 'R5C8', 'R6C7', 'R6C8'],
    arms: [['R3C9', 'R4C8', 'R5C8'], ['R6C7', 'R7C6']],
  },
  {
    circle: ['R7C6', 'R7C7', 'R8C6', 'R8C7'],
    arms: [['R8C7', 'R9C7', 'R9C6']],
  },
  {
    circle: ['R6C8', 'R6C9', 'R7C8', 'R7C9'],
    arms: [['R6C8'], ['R6C9', 'R5C9']],
  },
  {
    circle: ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
    arms: [['R6C5', 'R7C4', 'R8C4', 'R9C4']],
  },
  {
    circle: ['R4C2', 'R4C3', 'R5C2', 'R5C3'],
    arms: [['R3C1'], ['R4C3', 'R4C4']],
  },
  {
    circle: ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
    arms: [['R8C3', 'R8C2']],
  },
];

function injectiveAssignments(items, choices) {
  if (!items.length) return [[]];
  const [first, ...rest] = items;
  return choices.flatMap((choice, index) =>
    injectiveAssignments(rest, choices.filter((_, other) => other !== index))
      .map((tail) => [[first, choice], ...tail]));
}

function quadrarrow({circle, arms}) {
  return new Or(injectiveAssignments(arms, circle).map((assignment) =>
    new And(assignment.map(([arm, digit]) => new EqualSum(arm, [digit])))));
}

return [
  new Shape('9x9'),
  ...quadrarrows.map(quadrarrow),
];
