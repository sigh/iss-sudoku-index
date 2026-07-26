// Title: The Third Law Of Thermodynamics
// Author: gdc
// Video: https://www.youtube.com/watch?v=4sSpZ2U84aU
// Source: https://sudokupad.app/29hyhl8ay5

// Normal sudoku rules apply (default row/column/box all-different).
// Dynamic fog is solving UI only, not a final-grid rule; not encoded.
//
// Entropy: every 2x2 area contains a low (1-3), middle (4-6), and high (7-9)
// digit. GlobalEntropy is exactly this 9x9 rule.
//
// Thermo: digits increase from the bulb along a grey thermo of exactly 4
// cells, orthogonal only, no branching/overlap. The puzzle draws six thermo
// bulbs (circle markers with a first-step direction stub), but only two of
// them have a further cell drawn all the way to its centre -- the rest of
// every thermo's path is invisible in the source art and only discoverable
// by playing the puzzle under fog. Encoding only the two confirmed bulb ->
// next-cell orderings below is a sound, weaker relaxation of the full
// 4-cell rule; the other four bulbs and the remaining cells of all six
// thermos are omitted.
const partialThermos = [
  ['R3C7', 'R2C7'],
  ['R4C5', 'R5C5'],
];

return [
  new Shape('9x9'),

  new Given('R3C9', 5),

  new GlobalEntropy(),

  ...partialThermos.map(cells => new Thermo(...cells)),
];
