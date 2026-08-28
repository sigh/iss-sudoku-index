// Title: Broken Windoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Y7jlKeL0Eoc
// Source: https://cracking-the-cryptic.web.app/sudoku/MQGdR6Br6m

// Normal sudoku rules apply (standard rows/columns/3x3 boxes -- the drawn
// regions match the default boxes). Digits on an arrow sum to the number in
// the circle. The four coloured windows each contain 1-9, except for one of
// them, which doesn't.
//
// Givens R2C5=5, R6C5=7 (as drawn).

const shape = new Shape('9x9');

const givens = [
  new Given('R2C5', 5),
  new Given('R6C5', 7),
];

// Arrow groups: bulb cell, then each tail's cells (from the bulb, exclusive,
// to the tip). Several bulbs have more than one tail drawn from them: only 6
// of the 11 drawn lines start at an offset "circle edge" waypoint (a real
// drawn bulb); the other 5 start exactly on a cell centre, i.e. mid-line
// continuations of a sibling's tail, not fresh bulbs of their own. Each tail
// is its own Arrow, so a shared bulb sums each tail independently.
const arrowGroups = [
  ['R3C3', ['R2C2', 'R2C3', 'R1C3'], ['R2C2', 'R3C2', 'R3C1']],
  ['R6C6', ['R5C5', 'R4C4']],
  ['R7C3', ['R8C2', 'R8C3', 'R9C3'], ['R8C2', 'R7C2', 'R6C2'], ['R8C2', 'R7C2', 'R7C1']],
  ['R9C5', ['R8C6', 'R7C5']],
  ['R7C7', ['R8C8', 'R7C8', 'R7C9'], ['R8C8', 'R8C7', 'R9C7']],
  ['R3C7', ['R2C8', 'R2C7', 'R1C7'], ['R2C8', 'R3C8', 'R3C9']],
];
const arrows = arrowGroups.flatMap(
  ([bulb, ...tails]) => tails.map(tail => new Arrow(bulb, ...tail)));

// The four windoku windows, in the standard offset positions the drawn
// purple highlight covers (R2-4/C2-4, R2-4/C6-8, R6-8/C2-4, R6-8/C6-8).
const windows = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
];

function allPairs(cells) {
  const result = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) result.push([cells[i], cells[j]]);
  }
  return result;
}

// "Doesn't contain 1-9" for a 9-cell/9-value region means some pair of its
// cells repeats a digit: Or over every cell pair being equal.
const equalKey = Pair.fnToKey((a, b) => a === b, shape);
const notAllDifferent = cells =>
  new Or(allPairs(cells).map(([a, b]) => new Pair(equalKey, 'equal', a, b)));

// Exactly one window is exempt from the all-1-9 rule; the rules never say
// which, so disjoin over the 4 choices of exempt window (the other three
// stay AllDifferent, and the exempt one is forced to actually repeat, so a
// grid where all four happen to hold 1-9 is correctly excluded too).
const windoku = new Or(windows.map((exempt, i) => new And([
  ...windows.filter((_, j) => j !== i).map(w => new AllDifferent(...w)),
  notAllDifferent(exempt),
])));

return [shape, ...givens, ...arrows, windoku];
