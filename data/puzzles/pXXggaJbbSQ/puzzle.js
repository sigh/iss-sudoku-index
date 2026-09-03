// Title: Exclusivity
// Author: zetamath
// Video: https://www.youtube.com/watch?v=pXXggaJbbSQ
// Source: https://sudokupad.app/2sly4fnrqh

// Normal sudoku rules apply. Additionally, no digit may appear more than once on a
// particular clue type.
//   Type 1: digits on a purple line form a set of non-repeating, consecutive
//           digits in any order.
//   Type 2: along green lines, adjacent digits must differ by at least 5.
//   Type 3: digits separated by a black dot have a 1:2 ratio, meaning one is
//           exactly double the other.
//   Type 4: digits along a grey thermometer must increase from the bulb end.
//   Type 5: digits along an arrow sum to the digit in that arrow's circle.
// Every clause above is encoded; nothing is omitted.

// Drawn clue geometry, transcribed from the puzzle's purple lines, green lines,
// black dots, grey thermometers and arrows. Each list is one drawn clue, in the
// order the stroke visits its cells; thermometers start at the bulb and arrows
// start at the circle.
const purpleLines = [
  ['R3C4', 'R3C5', 'R3C6'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R6C8', 'R6C9'],
];
const greenLines = [
  ['R2C3', 'R1C3', 'R1C4', 'R1C5'],
  ['R3C2', 'R3C1', 'R4C1', 'R5C1'],
];
const blackDots = [
  ['R4C5', 'R5C5'],
  ['R7C9', 'R8C9'],
];
const thermos = [
  ['R2C6', 'R2C7', 'R3C7'],
  ['R4C4', 'R5C4'],
  ['R9C6', 'R9C5', 'R9C4'],
];
const arrows = [
  ['R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R6C3', 'R7C4', 'R7C5'],
];

// The exclusivity clause, one AllDifferent over the union of each type's cells.
// A thermometer's bulb cell and an arrow's circle cell are cells of their clue --
// the rules read the thermometer "from the bulb end", and each arrow stroke is
// drawn starting inside its own circle cell -- so both are in their type's set.
// Every union is at most 9 cells, so each is expressible as one region.
const exclusivity = [purpleLines, greenLines, blackDots, thermos, arrows]
    .map((clues) => new AllDifferent(...clues.flat()));

return [
  new Shape('9x9'),
  new Given('R5C7', 6),
  ...purpleLines.map((cells) => new Renban(...cells)),
  ...greenLines.map((cells) => new Whisper(5, ...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...arrows.map((cells) => new Arrow(...cells)),
  ...exclusivity,
];
