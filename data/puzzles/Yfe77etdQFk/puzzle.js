// Title: Boomerangs in Orbit
// Author: Sudoku Noob
// Video: https://www.youtube.com/watch?v=Yfe77etdQFk
// Source: https://sudokupad.app/gjwn9e0c5u

// Normal sudoku rules apply. No given digits.
//
// German Whispers (green lines): adjacent digits differ by at least 5.
// Renban Lines (pink lines): each line holds a set of consecutive digits, in
//   any order.
// Sum XV: an "X" between two cells means those two digits sum to 10; a "V"
//   means they sum to 5. Only the marked pairs are constrained -- the rules
//   give no "all such pairs are marked" clause, so unmarked adjacent pairs
//   are unrestricted.
//
// One green whisper line and one pink renban line touch at R4C5, the shared
// bend cell of a "boomerang" shape; they are drawn as a single bent stroke
// but are two separate, differently-coloured clues per the rules text, so
// R4C5 simply belongs to both.

const whispers = [
  // German Whisper lines (green).
  new Whisper('R3C4', 'R3C5', 'R3C6'),
  new Whisper('R4C7', 'R5C7', 'R6C7'),
  new Whisper('R7C6', 'R7C5', 'R7C4'),
  new Whisper('R6C3', 'R5C3', 'R4C3'),
  new Whisper('R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3'),
  new Whisper('R2C9', 'R3C9'),
  new Whisper('R6C5', 'R5C5', 'R4C5'),
];

const renbans = [
  // Renban lines (pink).
  new Renban('R9C7', 'R8C7', 'R7C7', 'R7C8', 'R7C9'),
  new Renban('R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3'),
  new Renban('R4C4', 'R4C5'),
  new Renban('R5C1', 'R5C2'),
];

const xv = [
  // Sum XV overlays (edge text marks).
  new V('R9C1', 'R9C2'),
  new X('R8C8', 'R9C8'),
  new X('R8C9', 'R9C9'),
  new V('R7C5', 'R8C5'),
  new X('R2C7', 'R3C7'),
  new V('R1C7', 'R2C7'),
  new X('R3C8', 'R3C9'),
  new V('R5C2', 'R5C3'),
  new X('R2C2', 'R2C3'),
  new X('R6C7', 'R6C8'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  ...xv,
];
