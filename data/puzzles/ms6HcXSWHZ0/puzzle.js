// Title: Hidden Little Killers
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=ms6HcXSWHZ0
// Source: https://app.crackingthecryptic.com/sudoku/Jfdb4h38Rb

// Normal sudoku. Killer cages sum to the shown total (with all-different)
// where a total is given; a cage with no total is all-different only.
// Digits increase from the bulb along the thermo.
//
// Each of the 8 diagonal (little killer) clues outside the grid is hidden:
// its sum is not shown, but equals the 2-digit number formed by one killer
// cage's two digits (tens digit first, per that cage's own left-to-right or
// top-to-bottom reading order), and the mapping clue<->cage is an unknown
// bijection (one clue per cage and vice versa). This is encoded with an
// auxiliary Var M holding, per clue, which cage (1-8, in cagePairs order)
// it is hidden in: AllDifferent(M) forces the bijection, and the Or below
// picks the one cage consistent with that clue's diagonal sum.

// Cage cells in their rules-mandated reading order (tens digit cell first):
// horizontal cages read left-to-right, vertical cages read downward.
const cagePairs = [
  ['R2C7', 'R2C8'], // cages[0] R2C7,R2C8 total 7 (horizontal)
  ['R3C1', 'R3C2'], // cages[1] R3C1,R3C2 total 10 (horizontal)
  ['R5C2', 'R5C3'], // cages[2] R5C2,R5C3 total 5 (horizontal)
  ['R7C3', 'R7C4'], // cages[3] R7C3,R7C4 total 6 (horizontal)
  ['R9C2', 'R9C3'], // cages[4] R9C2,R9C3 total 10 (horizontal)
  ['R6C6', 'R6C7'], // cages[5] R6C6,R6C7 no total (horizontal)
  ['R7C7', 'R8C7'], // cages[6] R7C7,R8C7 no total (vertical)
  ['R1C5', 'R2C5'], // cages[7] R1C5,R2C5 no total (vertical)
];

// Diagonal cell runs for the 8 outside little-killer arrows: each drawn
// off-grid arrow snapped to its entry cell, then walked to the grid edge
// in the drawn diagonal direction.
const diagonals = [
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'], // arrows[0] down-right
  ['R7C1', 'R8C2', 'R9C3'],                 // arrows[1] down-right
  ['R8C1', 'R9C2'],                         // arrows[2] down-right
  ['R8C9', 'R9C8'],                         // arrows[3] down-left
  ['R7C9', 'R8C8', 'R9C7'],                 // arrows[4] down-left
  ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'], // arrows[5] down-left
  ['R1C3', 'R2C2', 'R3C1'],                 // arrows[6] down-left
  ['R1C7', 'R2C8', 'R3C9'],                 // arrows[7] down-right
];

const M = new Var('M', 'HiddenCageForClue', cagePairs.length);

return [
  new Shape('9x9'),

  // Killer cages with a shown total.
  new Cage(7, 'R2C7', 'R2C8'),
  new Cage(10, 'R3C1', 'R3C2'),
  new Cage(5, 'R5C2', 'R5C3'),
  new Cage(6, 'R7C3', 'R7C4'),
  new Cage(10, 'R9C2', 'R9C3'),

  // Killer cages with no shown total: all-different only.
  new AllDifferent('R6C6', 'R6C7'),
  new AllDifferent('R7C7', 'R8C7'),
  new AllDifferent('R1C5', 'R2C5'),

  // Thermo: the line is drawn tip-first (bulb overlay sits on R7C5, the
  // LAST drawn cell), so the increasing order (bulb first) is the reverse
  // of the drawn order: R7C5 then R6C5.
  new Thermo('R7C5', 'R6C5'),

  M,
  new AllDifferent(...M.cells()),
  ...diagonals.map((cells, i) => new Or(
    cagePairs.map(([tens, ones], j) => new And([
      // diagonal sum == 10*tens + ones
      new Sum(0, ...cells, [tens, -10], [ones, -1]),
      new Given(M.cell(i + 1), j + 1),
    ]))
  )),
];
