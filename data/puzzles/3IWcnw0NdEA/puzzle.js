// Title: The Spider
// Author: Bobo
// Video: https://www.youtube.com/watch?v=3IWcnw0NdEA
// Source: https://sudokupad.app/jw1onozqhg

// Rules:
//   Normal sudoku rules apply.
//   Two cells connected by a spider leg must have a difference of at least 5.
//   Cells on the spider's body strictly increase as they move away from the
//     abdomen bulge.
//   Cells touched by the ghost are odd.
//   Cells joined by a pumpkin are consecutive.
//   Cells joined by a bat sum to 6.
//   The black cat just happens to hang out there... (explicitly decorative:
//     the cat marks the R4C7/R4C8 border and constrains nothing).
// No given digits.

// The eight thin bright-green strokes, each listed in drawn order.
const legs = [
  ['R9C4', 'R8C3', 'R7C3', 'R6C4'],
  ['R7C2', 'R6C2', 'R5C3', 'R5C4'],
  ['R4C2', 'R3C2', 'R3C3', 'R4C4'],
  ['R2C2', 'R1C2', 'R2C3', 'R3C4'],
  ['R3C6', 'R2C7', 'R1C8', 'R2C8'],
  ['R4C8', 'R3C8', 'R3C7', 'R4C6'],
  ['R5C6', 'R5C7', 'R6C8', 'R7C8'],
  ['R6C6', 'R7C7', 'R8C7', 'R9C6'],
];

// The ghost glyph is centred on the C7/C8 border and spans just under two cells
// vertically from just above the R1/R2 border, so it covers this 2x2 block.
const ghostCells = ['R1C7', 'R1C8', 'R2C7', 'R2C8'];

// Pumpkin glyphs, each drawn on the border between the two cells listed.
const pumpkins = [
  ['R4C4', 'R5C4'],
  ['R2C3', 'R3C3'],
];

// Bat glyphs, each drawn on the border between the two cells listed.
const bats = [
  ['R1C4', 'R2C4'],
  ['R6C9', 'R7C9'],
  ['R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),

  // Body: the thick stroke up column 5, bulb end (the abdomen bulge) first.
  new Thermo('R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5'),

  // Whisper binds consecutive pairs in list order, which is the "connected by a
  // leg" relation here; the legs run diagonally in places.
  ...legs.map((cells) => new Whisper(5, ...cells)),

  ...ghostCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),

  ...pumpkins.map(([a, b]) => new WhiteDot(a, b)),

  ...bats.map(([a, b]) => new Sum(6, a, b)),
];
