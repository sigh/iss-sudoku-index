// Title: Anti-XV Thermo Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=OWlwc-P-AIU
// Source: https://cracking-the-cryptic.web.app/sudoku/HRPTqtnHp3

// Normal sudoku rules apply: Shape gives the 9x9 grid plus row, column and
// box all-different groups. No givens.
//
// "No pair of neighbouring cells adds to 5 or 10." No X/V dots are drawn
// anywhere in the puzzle, so StrictXV's usual "only marked pairs obey XV"
// behaviour degenerates to its negative half for every adjacent pair in the
// grid: with zero X/V constraints supplied, every orthogonally adjacent cell
// pair gets the sum != 5 and sum != 10 constraint.
const noFiveOrTen = new StrictXV();

// "Digits increase along thermometers from the bulb." Five grey thermometers,
// each anchored by a filled circle at its bulb. Two are drawn as one simple
// strand (bulb-first or, for one, bulb-last -- see below). Three are
// Y-shaped: one continuous stroke can only be linear, so a branch is always
// drawn as a corner cell shared or marked by two things -- either two
// separate line entries meeting at an unmarked cell, or one line entry whose
// bulb circle sits on an interior cell instead of an endpoint. Either way the
// two halves either side of the bulb are independent increasing arms, which
// is encoded here as one Thermo per arm, each starting at the shared bulb
// cell.
//
// Thermo 1: line entries R1C3-R1C2-R1C1-R2C1-R3C1-R4C1-R5C1 and
// R3C3-R3C2-R3C1 meet at R3C1; only R1C3 carries a bulb circle, so R3C1 is
// the branch point, not a second bulb.
const thermo1Stem = ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'];
// Thermo 2: single line entry R4C7-R5C7-R6C7-R6C8-R6C9-R5C9 with its bulb
// circle on the interior cell R6C8.
// Thermo 4: single line entry R7C7-R7C8-R7C9-R8C9-R9C9-R9C8-R9C7 whose bulb
// circle sits on R9C7, the last cell of the drawn stroke -- so the increasing
// direction is the reverse of the drawn order.
// Thermo 5: single line entry R9C3-R9C4-R9C5-R8C5-R7C5-R7C4-R7C3-R7C2-R8C2
// with its bulb circle on the interior cell R7C5.
const thermos = [
  new Thermo(...thermo1Stem, 'R4C1', 'R5C1'),
  new Thermo(...thermo1Stem, 'R3C2', 'R3C3'),
  new Thermo('R6C8', 'R6C7', 'R5C7', 'R4C7'),
  new Thermo('R6C8', 'R6C9', 'R5C9'),
  new Thermo('R4C9', 'R4C8', 'R5C8'),
  new Thermo('R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7'),
  new Thermo('R7C5', 'R8C5', 'R9C5', 'R9C4', 'R9C3'),
  new Thermo('R7C5', 'R7C4', 'R7C3', 'R7C2', 'R8C2'),
];

return [
  new Shape('9x9'),
  noFiveOrTen,
  ...thermos,
];
