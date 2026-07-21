// Title: Twirled mermaid goes forklift
// Author: olima
// Video: https://www.youtube.com/watch?v=kYS4k8oFN7U
// Source: https://sudokupad.app/4ctb5mbrk8

// Normal Sudoku rules apply. Teal lines are modular, green lines are German
// whispers, purple lines are renbans, and the thin gray line balances its
// interior cells against its two endpoint circles.
const modularLines = [
  ['R3C1', 'R2C1', 'R1C1', 'R2C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R6C1', 'R5C1', 'R4C1', 'R5C2', 'R4C3', 'R5C3', 'R6C3'],
  ['R3C7', 'R3C8', 'R2C8'],
];

const whisperLines = [
  ['R4C9', 'R4C8', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9', 'R5C8'],
  ['R1C7', 'R2C7', 'R2C8', 'R2C9', 'R1C9'],
  ['R2C8', 'R1C8'],
];

const renbanLines = [
  ['R3C4', 'R2C4', 'R1C4', 'R1C5', 'R2C6', 'R2C5', 'R3C6'],
  ['R7C3', 'R7C2', 'R8C2'],
  ['R7C4', 'R8C4', 'R9C4', 'R9C3', 'R9C2'],
  ['R8C8', 'R7C8', 'R7C7', 'R7C6', 'R8C6', 'R9C6', 'R9C7'],
];

const cages = [
  ['R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C8', 'R9C6', 'R9C7', 'R9C8'],
  ['R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
];

const oddCells = [
  'R1C8', 'R3C8', 'R5C5', 'R7C3', 'R7C7', 'R8C2',
  'R8C4', 'R8C6', 'R8C8', 'R9C3', 'R9C7',
];
const evenCells = ['R3C7', 'R3C9'];

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const markedDiagonal = graph.ray('R1C9', 1, -1);

return [
  new Shape('9x9'),
  ...modularLines.map(cells => new Modular(3, ...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...cages.map(cells => new AllDifferent(...cells)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  new EqualSum(
    ['R5C4', 'R4C5', 'R5C6'],
    ['R6C4', 'R6C6'],
  ),
  LittleKiller.fromCells(60, markedDiagonal, geometry),
];
