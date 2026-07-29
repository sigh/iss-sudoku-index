// Title: 21
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=_ZSW5TXXBA4
// Source: https://sudokupad.app/5c6uuvchca

// Normal sudoku rules apply. Green-line neighbours differ by at least five.
// Each outside 21 is an X-sum read from its adjacent edge.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Green paths transcribed from the drawn green lines; the R7C7 branch is a
// separate stroke and therefore adds its own adjacent pair.
const greenLines = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R5C9', 'R6C9'],
  ['R5C1', 'R6C1'],
  ['R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R4C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C8'],
  ['R7C7', 'R7C6'],
  ['R4C2', 'R3C3', 'R4C4', 'R5C3', 'R6C2', 'R7C2', 'R7C3', 'R7C4'],
];

return [
  new Shape('9x9'),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  XSum.fromCells(21, graph.column('R1C6'), geometry),
  XSum.fromCells(21, graph.row('R7C1'), geometry),
  XSum.fromCells(21, graph.column('R9C4').reverse(), geometry),
];
