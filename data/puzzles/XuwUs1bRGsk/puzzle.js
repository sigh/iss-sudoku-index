// Title: Xmas 2025
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=XuwUs1bRGsk
// Source: https://sudokupad.app/g4vx2p0ewp

// Green lines: adjacent digits along the line differ by at least 5
// (German Whisper).
const whisperLines = [
  ['R3C3', 'R2C4', 'R1C5', 'R2C6', 'R3C7'],
  ['R5C3', 'R5C2', 'R4C3', 'R3C4'],
  ['R5C7', 'R5C8', 'R4C7', 'R3C6'],
  ['R5C6', 'R6C7', 'R7C8', 'R7C7', 'R7C6', 'R8C5', 'R7C4', 'R7C3', 'R7C2',
    'R6C3', 'R5C4'],
];

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  ...whisperLines.map(cells => new Whisper(5, ...cells)),

  // Circled 2x2 intersections: each listed digit appears at least once among
  // the four cells touching that circle.
  new Quad('R5C1', 1, 4),
  new Quad('R3C7', 5, 6),
  new Quad('R5C8', 2, 4),
  new Quad('R3C2', 2, 4, 7, 9),
  new Quad('R7C1', 2, 7),
  new Quad('R7C8', 3),

  // Outside-grid column clues: sum of the digits strictly between the 1 and
  // the 9 in that column (Sandwich), given above columns 2-5.
  Sandwich.fromCells(2, graph.column(2), geometry),
  Sandwich.fromCells(0, graph.column(3), geometry),
  Sandwich.fromCells(2, graph.column(4), geometry),
  Sandwich.fromCells(5, graph.column(5), geometry),
];
