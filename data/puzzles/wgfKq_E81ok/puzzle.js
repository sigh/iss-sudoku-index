// Title: The Leaning Tower Of ZooZ
// Author: Joseph Nehme (ZooZ)
// Video: https://www.youtube.com/watch?v=wgfKq_E81ok
// Source: https://app.crackingthecryptic.com/sudoku/M3M3d3hDpJ

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). No given digits. Cells a knight's move apart
// cannot repeat a digit (AntiKnight). Digits along an arrow sum to the digit
// in the arrow's bulb cell (the first cell of each Arrow below). One bulb
// (R6C4) anchors six separate arrows -- the drawn "tower"; ISS's Arrow class
// has no UNIQUENESS_KEY_FIELD, so all six instances at that shared bulb are
// kept, as are the two instances sharing R4C5 and the two sharing R5C6.

return [
  new Shape('9x9'),
  new AntiKnight(),

  new Arrow('R1C5', 'R1C4', 'R1C3'),

  new Arrow('R4C5', 'R3C4'),
  new Arrow('R4C5', 'R3C6', 'R2C6', 'R3C7'),

  new Arrow('R6C4', 'R5C5', 'R4C6'),
  new Arrow('R6C4', 'R5C4', 'R4C4'),
  new Arrow('R6C4', 'R6C5', 'R6C6'),
  new Arrow('R6C4', 'R7C5', 'R8C5'),
  new Arrow('R6C4', 'R6C3', 'R7C4'),
  new Arrow('R6C4', 'R5C3', 'R5C2'),

  new Arrow('R5C6', 'R4C7', 'R4C8', 'R3C7'),
  new Arrow('R5C6', 'R6C7'),

  new Arrow('R5C8', 'R5C7', 'R6C8'),
];
