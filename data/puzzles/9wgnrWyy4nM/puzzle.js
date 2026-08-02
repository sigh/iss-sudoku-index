// Title: Renban Windmill Sudoku
// Author: Laura Bradby
// Video: https://www.youtube.com/watch?v=9wgnrWyy4nM
// Source: https://app.crackingthecryptic.com/sudoku/LMNPbhgr93

// Standard Sudoku rules apply. Purple lines are Renban lines. A clockwise
// quarter-turn advances 1-2-3-4-1 and 5-6-7-8-5, while 9 maps to itself.
const renbans = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R3C3', 'R3C4'],
  ['R3C6', 'R3C7'],
  ['R3C5', 'R4C5'],
  ['R6C5', 'R7C5'],
  ['R6C2', 'R7C1'],
  ['R6C9', 'R7C9'],
]; // Purple line paths from the drawn puzzle.

const rotate90 = cell => {
  const {row, col} = parseCellId(cell);
  return makeCellId(col, 10 - row);
};
const cells = Array.from({length: 81}, (_, index) =>
  makeCellId(Math.floor(index / 9) + 1, index % 9 + 1));
const successor = Pair.fnToKey(
  (a, b) => a === 9 ? b === 9 : b !== 9 && (b - 1) % 4 === a % 4,
  9);
const rotationCycles = cells
  .filter(cell => cell !== 'R5C5')
  .filter(cell => cell === [cell, rotate90(cell), rotate90(rotate90(cell)),
    rotate90(rotate90(rotate90(cell)))].sort()[0])
  .map(cell => new Pair(successor, 'clockwise digit map', cell, rotate90(cell),
    rotate90(rotate90(cell)), rotate90(rotate90(rotate90(cell))), cell));
// Each representative starts one four-cell clockwise orbit; repeating it closes the map.

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  new Given('R5C5', 9), // The centre is fixed by rotation and 9 is the only fixed digit.
  ...rotationCycles,
];
