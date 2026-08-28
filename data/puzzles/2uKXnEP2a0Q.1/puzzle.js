// Title: Magic Thermo Sudoku
// Author: Wessel Strijkstra
// Video: https://www.youtube.com/watch?v=2uKXnEP2a0Q
// Source: https://cracking-the-cryptic.web.app/sudoku/gMJNqTg6T9

// Normal sudoku rules apply (default rows/columns/boxes). Rules text is
// carried only by the video description, not the payload: "digits must
// increase along thermometers from bulb to end" and "the blue cells form a
// magic square using 1-9".
//
// Six 5-cell thermometers are drawn. A bulb-circle overlay sits at exactly
// four cells (R5C1, R1C9, R9C5, R9C9); two of those bulbs each carry two
// drawn arms sharing the one bulb cell (a Y-shaped thermometer), the other
// two carry a single arm. Two arm tips coincide (R1C5, R5C9) but carry no
// bulb overlay, so they are ordinary tip cells, not bulbs. Each arm is
// encoded as its own Thermo, bulb cell first; a shared bulb pins the same
// cell as the first cell of two Thermo constraints, which is exactly a
// Y-thermometer's semantics (bulb below both of its neighbours).
const thermos = [
  ['R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'],
  ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5'],
  ['R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9'],
];

// The nine blue-shaded cells sit one per box, at the crossing of rows
// 1/5/9 and columns 1/5/9 (underlay colour deepskyblue). Read as a virtual
// 3x3 grid, "form a magic square using 1-9" means: all nine digits appear
// once each (AllDifferent -- most of these pairs are not already forced
// distinct by row/column/box), and every row, column, and diagonal of that
// virtual grid shares a common sum (EqualSum forces the common sum to 15,
// since the nine digits are exactly 1-9).
const magic = [
  ['R1C1', 'R1C5', 'R1C9'],
  ['R5C1', 'R5C5', 'R5C9'],
  ['R9C1', 'R9C5', 'R9C9'],
  ['R1C1', 'R5C1', 'R9C1'],
  ['R1C5', 'R5C5', 'R9C5'],
  ['R1C9', 'R5C9', 'R9C9'],
  ['R1C1', 'R5C5', 'R9C9'],
  ['R1C9', 'R5C5', 'R9C1'],
];
const magicCells = [
  'R1C1', 'R1C5', 'R1C9', 'R5C1', 'R5C5', 'R5C9', 'R9C1', 'R9C5', 'R9C9',
];

return [
  new Shape('9x9'),

  new Given('R3C6', 2),
  new Given('R7C4', 8),

  ...thermos.map(cells => new Thermo(...cells)),

  new AllDifferent(...magicCells),
  new EqualSum(...magic),
];
