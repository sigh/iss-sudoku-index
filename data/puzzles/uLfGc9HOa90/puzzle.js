// Title: Polar Attraction
// Author: Piatato
// Video: https://www.youtube.com/watch?v=uLfGc9HOa90
// Source: https://app.crackingthecryptic.com/sudoku/n4nJGhfmf4

// Normal sudoku (default row/column/box) plus killer cages: digits in a cage
// cannot repeat, and sum to the shown total. Two cages carry no total (from
// the payload's `cages` array) and are all-different only. The payload's
// `lines` entries duplicate the box-divider grid lines at the box edges'
// colour/thickness, and its one `underlays` entry is a whole-board white
// background rectangle -- both decorative, not additional clues.
return [
  new Shape('9x9'),

  new Given('R5C5', 6),
  new Given('R9C9', 9),

  new Cage(24, 'R1C3', 'R1C4', 'R2C4'),
  new Cage(6, 'R3C1', 'R4C1', 'R4C2'),
  new Cage(7, 'R2C8', 'R2C9'),
  new Cage(16, 'R3C8', 'R3C9', 'R4C8', 'R4C9'),
  new Cage(13, 'R8C2', 'R9C2'),
  new Cage(24, 'R8C3', 'R8C4', 'R9C3', 'R9C4'),
  new Cage(8, 'R6C9', 'R7C9'),
  new Cage(12, 'R9C6', 'R9C7'),

  // No-total cages: all-different only, no sum.
  new AllDifferent(
    'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R3C5', 'R3C6', 'R3C7'),
  new AllDifferent(
    'R5C3', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R9C1'),
];
