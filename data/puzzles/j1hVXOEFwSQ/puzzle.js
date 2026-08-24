// Title: Spaghetti
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=j1hVXOEFwSQ
// Source: https://app.crackingthecryptic.com/sudoku/H4fBMgLJMb

// Normal sudoku rules (default rows/cols/boxes, standard 3x3 box regions).
// Anti-knight: identical digits cannot be a knight's move apart. Nine
// arrows (bulb cell = sum of its arm cells, repeats permitted on the arm);
// three of them share the same bulb at R1C1.

// Arrow bulb (first cell, the drawn circle) and arm cells, transcribed from
// the `arrows` wayPoints paths and cross-checked against the `overlays`
// circle positions (every circle is consumed exactly once across all bulbs).
const arrows = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4'],
  ['R1C1', 'R2C2', 'R2C3', 'R2C4', 'R3C5'],
  ['R1C1', 'R2C2', 'R3C2', 'R4C2', 'R5C3'],
  ['R2C6', 'R1C5', 'R1C4'],
  ['R3C6', 'R4C6', 'R5C5', 'R6C6'],
  ['R8C7', 'R8C6', 'R9C5', 'R9C4'],
  ['R5C8', 'R5C9', 'R6C8', 'R7C9', 'R8C9'],
  ['R9C8', 'R8C8', 'R7C7'],
  ['R4C7', 'R4C8', 'R3C8', 'R2C8', 'R1C7'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  new AntiKnight(),
];
