// Title: Look-and-Say Killer 3
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=Mx9CYuYRwFg
// Source: https://app.crackingthecryptic.com/sudoku/6PfGMdqN2G

// Normal sudoku rules apply (default Shape('9x9') gives rows/columns/boxes).
// Diagonals and cages are NOT standard: digits MAY repeat within a cage or
// along an indicated diagonal, and no sum is implied -- each clue is a
// look-and-say number read as (count, digit) pairs (LookAndSay's own
// semantics), so cages/diagonals below use LookAndSay only, never Cage or an
// all-different group.

// Cages: cell lists and clues transcribed from the puzzle's cage geometry
// (cell set, clue number); non-cage metadata entries are omitted.
const cages = [
  ['13', 'R2C1', 'R3C1', 'R2C2'],
  ['26', 'R4C3', 'R3C3', 'R3C4'],
  ['12', 'R1C4', 'R1C5', 'R2C5'],
  ['13', 'R2C6', 'R3C6'],
  ['12', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['14', 'R4C7', 'R4C8', 'R4C9', 'R5C9'],
  ['11', 'R5C7', 'R6C7'],
  ['12', 'R6C8', 'R6C9'],
  ['16', 'R7C8', 'R7C9'],
  ['12', 'R8C9', 'R9C9', 'R9C8'],
  ['14', 'R8C4', 'R9C4', 'R9C5'],
  ['16', 'R7C6', 'R8C6'],
  ['14', 'R4C5', 'R5C5', 'R5C4'],
  ['11', 'R6C1', 'R6C2'],
  ['17', 'R7C1', 'R8C1', 'R9C1'],
  ['15', 'R7C3', 'R8C3'],
];

// Diagonals: each is drawn as a short arrowhead just outside the grid edge,
// fixing a start cell and a diagonal direction; the drawn cell path is the
// ray to the opposite board edge. Paired with the nearest outside clue --
// pairing confirmed self-consistent: every resulting look-and-say count is
// <= the diagonal's length.
const diagonals = [
  ['24', 'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['24', 'R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  ['12', 'R1C3', 'R2C2', 'R3C1'],
  ['23', 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['38', 'R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'],
  ['37', 'R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['14', 'R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'],
  ['27', 'R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
  ['15', 'R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  ['15', 'R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['25', 'R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'],
];

return [
  new Shape('9x9'),
  ...cages.map(([clue, ...cells]) => new LookAndSay(clue, ...cells)),
  ...diagonals.map(([clue, ...cells]) => new LookAndSay(clue, ...cells)),
];
