// Title: 2021/11/26: Summoning Baphomet
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=4BA_LntMqbA
// Source: https://tinyurl.com/yc34zmun

// Normal sudoku rules apply. Every white circle straddles the four cells
// around one interior grid intersection (a 2x2 block).
//
// A value circle (printed digit) means: the largest digit among its four
// cells equals the printed value; digits, including the largest, may repeat
// around the circle.
//
// An arrow circle (diagonal arrow, no printed digit) means: the arrow points
// at the cell, among its four cells, holding the uniquely largest digit --
// every other cell in the block must be strictly less than the pointed-to
// cell.

// Value circles: [printed value, four cells (drawn payload order, geometry
// only -- see below)].
const valueCircles = [
  [6, ['R3C2', 'R3C3', 'R2C2', 'R2C3']],
  [6, ['R7C8', 'R7C7', 'R8C8', 'R8C7']],
  [5, ['R3C7', 'R3C8', 'R2C7', 'R2C8']],
  [5, ['R8C2', 'R8C3', 'R7C2', 'R7C3']],
  [7, ['R4C2', 'R4C1', 'R3C2', 'R3C1']],
  [6, ['R6C8', 'R6C9', 'R7C8', 'R7C9']],
  [8, ['R2C4', 'R2C5', 'R1C4', 'R1C5']],
  [9, ['R9C5', 'R9C6', 'R8C5', 'R8C6']],
  [9, ['R5C1', 'R5C2', 'R6C1', 'R6C2']],
  [8, ['R5C9', 'R5C8', 'R4C9', 'R4C8']],
  [3, ['R4C6', 'R4C7', 'R3C6', 'R3C7']],
  [2, ['R7C4', 'R7C3', 'R6C4', 'R6C3']],
];

// Arrow circles: [arrow direction (payload's unicode arrow, transliterated
// to a compass code: UL=up-left, UR=up-right, DR=down-right, DL=down-left),
// four cells (drawn payload order, geometry only)]. The pointed-to cell is
// derived below from the block's own min/max row and column, not from list
// order -- the payload does not use a consistent corner-ordering convention
// (e.g. the up-left-arrow block R9C2/R9C1/R8C2/R8C1 lists its target,
// R8C1, last).
const arrowCircles = [
  ['UL', ['R6C4', 'R6C5', 'R5C4', 'R5C5']],
  ['UL', ['R6C6', 'R6C7', 'R7C6', 'R7C7']],
  ['UL', ['R8C3', 'R8C4', 'R9C3', 'R9C4']],
  ['UL', ['R9C2', 'R9C1', 'R8C2', 'R8C1']],
  ['UR', ['R2C1', 'R2C2', 'R1C1', 'R1C2']],
  ['DR', ['R4C5', 'R4C6', 'R5C5', 'R5C6']],
  ['DR', ['R2C8', 'R2C9', 'R1C8', 'R1C9']],
  ['DR', ['R2C7', 'R2C6', 'R1C7', 'R1C6']],
  ['DR', ['R4C4', 'R4C3', 'R3C4', 'R3C3']],
  ['DL', ['R8C8', 'R8C9', 'R9C8', 'R9C9']],
];

// Corner of a 2x2 block (given as its four cells, any order) that a diagonal
// arrow direction names: UL -> min row/min col, UR -> min row/max col,
// DR -> max row/max col, DL -> max row/min col.
function arrowTargetCell(cells, dir) {
  const rows = cells.map(c => parseCellId(c).row);
  const cols = cells.map(c => parseCellId(c).col);
  const rowSel = { UL: Math.min, UR: Math.min, DR: Math.max, DL: Math.max }[dir](...rows);
  const colSel = { UL: Math.min, UR: Math.max, DR: Math.max, DL: Math.min }[dir](...cols);
  return makeCellId(rowSel, colSel);
}

// "Largest digit among these four cells equals v": an NFA tracking the
// running max over the four reads, accepting only if it lands on v.
const maxEquals = (v) => NFA.encodeSpec({
  startState: 0,
  transition: (runningMax, value) => Math.max(runningMax, value),
  accept: (runningMax) => runningMax === v,
}, 9);

const valueConstraints = valueCircles.map(
  ([v, cells]) => new NFA(maxEquals(v), 'max value', ...cells));

// "a is strictly greater than b", used to pin the arrow-circle target above
// each of the other three cells in its block.
const gtKey = Pair.fnToKey((a, b) => a > b, 9);

const arrowConstraints = arrowCircles.flatMap(([dir, cells]) => {
  const target = arrowTargetCell(cells, dir);
  const others = cells.filter(c => c !== target);
  return others.map(o => new Pair(gtKey, 'unique max arrow', target, o));
});

return [
  new Shape('9x9'),
  new Given('R1C5', 2),
  new Given('R5C1', 3),
  new Given('R5C9', 4),
  new Given('R9C5', 1),
  ...valueConstraints,
  ...arrowConstraints,
];
