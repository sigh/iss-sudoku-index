// Title: Tic Tac Todd
// Author: Josebastian8
// Video: https://www.youtube.com/watch?v=4Ykf9wzy6uw
// Source: https://app.crackingthecryptic.com/tRqJ93QNbT

// Normal Sudoku rules apply. The blue / diagonal has no repeated digits. Each
// outside clue is the sum along its indicated diagonal. Digits along every red
// stroke have the same parity.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const sameParity = Pair.fnToKey((a, b) => a % 2 === b % 2, 9);

// Red-stroke cells transcribed from the drawn red lines; repeated starts close loops.
const redLines = [
  ['R1C1', 'R2C2', 'R3C3'],
  ['R1C3', 'R2C2', 'R3C1'],
  ['R4C7', 'R5C8', 'R6C9'],
  ['R4C9', 'R5C8', 'R6C7'],
  ['R7C4', 'R8C5', 'R9C6'],
  ['R7C6', 'R8C5', 'R9C4'],
  ['R7C2', 'R8C1', 'R9C2', 'R8C3', 'R7C2'],
  ['R1C5', 'R2C4', 'R3C5', 'R2C6', 'R1C5'],
  ['R4C5', 'R5C4', 'R6C5', 'R5C6', 'R4C5'],
  ['R1C8', 'R2C7', 'R3C8', 'R2C9', 'R1C8'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  LittleKiller.fromCells(38, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R9C5', -1, 1), geometry),
  ...redLines.map(line => new Pair(sameParity, 'same parity', ...line)),
];
