// Title: Say It or Sum It
// Author: Artham
// Video: https://www.youtube.com/watch?v=xbzsgWROoNc
// Source: https://sudokupad.app/uc7g73j1zr

// Normal sudoku rules apply (rows, columns, and 3x3 boxes all contain 1-9;
// enforced by the default Shape). No given digits.
// Each of the 25 drawn cages is either a killer cage or a look-and-say cage
// (or both); which type applies to each cage is not indicated and must be
// deduced, so every cage is encoded as Or(sum reading, look-and-say reading).
// Killer cage: the cage's digits sum to its printed clue; digits may repeat
// (Sum, not Cage -- the rules explicitly allow repeats within a killer cage,
// leaving only the normal row/column/box rules to restrict them).
// Look-and-say cage: the printed clue, read as (count, value) digit pairs,
// states an exact count for each named value (LookAndSay's own semantics).
// A one-digit clue has no valid (count, value) pairing -- LookAndSay itself
// requires an even-length digit string and throws otherwise -- so the three
// cages with one-digit clues (totals 8, 8, 9) are encoded killer-only.

const cages = [
  // [total, cells...] -- transcribed from the puzzle's 25 drawn cages and
  // their printed top-left totals, one entry per cage.
  [9, 'R5C3', 'R5C4', 'R6C2', 'R6C3'],
  [8, 'R4C6', 'R5C6', 'R6C6'],
  [11, 'R4C5', 'R5C5'],
  [21, 'R6C4', 'R6C5', 'R7C3', 'R7C4', 'R8C3'],
  [26, 'R3C4', 'R3C5', 'R4C4'],
  [19, 'R7C5', 'R8C5', 'R9C5'],
  [27, 'R6C1', 'R7C1', 'R7C2'],
  [15, 'R8C1', 'R8C2', 'R9C1'],
  [24, 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
  [8, 'R8C6', 'R9C6', 'R9C7'],
  [14, 'R1C4', 'R1C5', 'R1C6', 'R2C6'],
  [13, 'R2C3', 'R2C4', 'R2C5', 'R3C3'],
  [14, 'R5C1', 'R5C2'],
  [25, 'R3C1', 'R3C2', 'R4C1'],
  [14, 'R4C2', 'R4C3'],
  [25, 'R6C7', 'R6C8', 'R7C8'],
  [23, 'R7C6', 'R7C7', 'R8C7', 'R8C8'],
  [18, 'R8C9', 'R9C8', 'R9C9'],
  [27, 'R3C6', 'R3C7', 'R4C7', 'R5C7'],
  [19, 'R4C9', 'R5C8', 'R5C9'],
  [13, 'R2C8', 'R3C8', 'R3C9', 'R4C8'],
  [14, 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9'],
  [13, 'R1C1', 'R2C1'],
  [15, 'R1C2', 'R1C3', 'R2C2'],
  [14, 'R6C9', 'R7C9'],
];

// Every clue here is 1 or 2 digits, so this parity check is exactly the
// "can LookAndSay parse this clue" test (its constructor requires an even,
// nonzero digit count).
const cageType = ([total, ...cells]) => String(total).length % 2 === 0
  ? new Or([new Sum(total, ...cells), new LookAndSay(total, ...cells)])
  : new Sum(total, ...cells);

return [
  new Shape('9x9'),
  ...cages.map(cageType),
];
