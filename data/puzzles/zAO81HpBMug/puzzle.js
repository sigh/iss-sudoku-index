// Title: Fearful Symmetry
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=zAO81HpBMug
// Source: https://sudokupad.app/5ss81z93l4

// Normal sudoku rules apply. Killer cages: digits do not repeat within a
// cage and sum to the given total. Renban lines: digits on a line form a
// set of consecutive, non-repeating digits, in any order.

// Killer cages, from the payload's killercage entries.
const cages = [
  new Cage(9, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(19, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(15, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(22, 'R5C5', 'R5C6', 'R6C5'),
  new Cage(12, 'R8C9', 'R9C8', 'R9C9'),
];

// Renban lines, from the payload's renban entries (the duplicate `line`
// entries are the same geometry rendered pink; not a second clue set).
const renbans = [
  new Renban('R2C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Renban('R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Renban('R5C2', 'R6C2', 'R7C2'),
  new Renban('R2C5', 'R2C6', 'R2C7'),
  new Renban('R4C5', 'R4C6', 'R4C7'),
  new Renban('R5C4', 'R6C4', 'R7C4'),
  new Renban('R6C7', 'R6C6', 'R7C6'),
  new Renban('R3C9', 'R4C9', 'R5C9'),
  new Renban('R9C3', 'R9C4', 'R9C5'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...renbans,
];
