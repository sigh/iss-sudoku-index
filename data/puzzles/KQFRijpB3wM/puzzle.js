// Title: Look-and-Say Killer 2
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=KQFRijpB3wM
// Source: https://app.crackingthecryptic.com/sudoku/pngjf2LGHq

// Normal sudoku rules apply (default Shape('9x9') gives rows/columns/boxes).
// Cages and diagonals are NOT standard: digits MAY repeat within a cage or
// along an indicated diagonal, and no sum is implied -- each clue is a
// look-and-say number read as (count, digit) pairs (LookAndSay's own
// semantics), so cages/diagonals below use LookAndSay only, never Cage or an
// all-different group.

// Cages: cell lists and clues transcribed from the puzzle's cage geometry
// (cell set, clue number); non-cage metadata entries (title/author/rules
// stubs) are omitted.
const cages = [
  ['12', 'R1C2', 'R2C2', 'R3C2', 'R3C3'],
  ['1617', 'R2C7', 'R3C7', 'R3C8'],
  ['2122', 'R6C2', 'R7C2', 'R7C3', 'R7C4', 'R8C4'],
  ['2412', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R7C6'],
  ['33', 'R4C6', 'R4C7', 'R5C7', 'R6C7', 'R5C8', 'R6C8', 'R7C7'],
  ['25', 'R6C9', 'R7C9', 'R7C8'],
  ['27', 'R8C3', 'R8C2', 'R9C2', 'R9C3', 'R9C4'],
];

// Diagonals: each is drawn as a short arrowhead just outside the grid edge,
// fixing a start cell (the corner nearest the arrowhead) and a diagonal
// direction; the drawn cell path is the ray to the opposite board edge.
// Paired with the nearest outside clue text (10 real arrows; the 11th arrow
// entry in the payload has no waypoints and renders nothing).
const diagonals = [
  ['12', 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['11', 'R1C7', 'R2C8', 'R3C9'],
  ['33', 'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['28', 'R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['24', 'R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'],
  ['29', 'R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  ['13', 'R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['19', 'R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
  ['31', 'R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'],
  ['38', 'R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'],
];

return [
  new Shape('9x9'),
  ...cages.map(([clue, ...cells]) => new LookAndSay(clue, ...cells)),
  ...diagonals.map(([clue, ...cells]) => new LookAndSay(clue, ...cells)),
];
