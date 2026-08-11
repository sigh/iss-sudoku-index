// Title: Dandelion
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=JTV9eLpO1Bs
// Source: https://app.crackingthecryptic.com/sudoku/GBggt6pP6b
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Cells a knight's move apart cannot repeat a digit -> AntiKnight (applies
// globally, not just to thermometer cells).
// Digits along a thermometer strictly increase from the bulb -> one Thermo
// per drawn line, bulb cell first.
//
// Thermometer cells were read bulb-first off the drawn line geometry
// (wayPoints, interpolated through any straight run) and cross-checked
// against the filled grey circle underlay marking each bulb -- all ten
// bulb-circle positions match the first cell of one of the ten lines.
const thermos = [
  ['R1C1', 'R2C1'],
  ['R5C2', 'R5C1'],
  ['R6C3', 'R5C3'],
  ['R4C3', 'R4C4', 'R4C5'],
  ['R3C4', 'R2C5', 'R3C5'],
  ['R7C6', 'R6C5', 'R5C4'],
  ['R9C4', 'R8C5', 'R7C5'],
  ['R4C7', 'R5C6', 'R6C6'],
  ['R5C8', 'R5C7'],
  ['R7C3', 'R6C4'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...thermos.map(cells => new Thermo(...cells)),
];
