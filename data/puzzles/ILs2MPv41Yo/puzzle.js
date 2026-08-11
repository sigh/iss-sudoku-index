// Title: Which Direction?
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=ILs2MPv41Yo
// Source: https://app.crackingthecryptic.com/sudoku/NgrqfFtmGB
//
// Normal sudoku, standard 3x3 boxes.
//
// White dots: consecutive digits. "Not all dots are given" forbids the
// negative reading, so only the five drawn edges are constrained.
//
// Diagonal "?" clues: from each "?" mark there are two candidate 45-degree
// diagonals (drawn as two short off-grid direction arrows). Digits along the
// real diagonal may repeat and sum to a two-digit number that is written,
// digit by digit (left-to-right or top-to-bottom), into one of the seven
// unlabelled killer cages. "One killer cage belongs to exactly one diagonal
// clue and vice versa" -- a bijection between the 7 markers and the 7 cages
// -- and "each diagonal clue is only valid in ONE of the two possible ways".
// Neither which cage pairs with which marker, nor which of the two
// directions is real, is drawn or stated anywhere else (no line is drawn
// across the grid interior; the arrows are direction stubs only), so both
// correspondences are genuinely open and are encoded as disjunctions.
//
// Each candidate diagonal below is the cell list actually crossed by that
// arrow's drawn 45-degree direction, walked from the board edge to the
// opposite side. Note the two rays from one "?" mark do not always share a
// start cell: e.g. the "Left R3" marker's up-right ray starts at R3C1, but
// its down-right ray starts one row down, at R4C1 (a consequence of the
// mark sitting at the row's centre outside the grid, so its two 45-degree
// rays cross the board edge at two different edge points).
//
// The killer-cage part of each cage needs no separate constraint: every one
// of the 7 cages has its two cells sharing a row or a column, so base sudoku
// already forces them distinct.
//
// Markers and their candidate diagonal rays:
//   M1 "Left R3":  up-right R3C1-R2C2-R1C3
//                  down-right R4C1-R5C2-R6C3-R7C4-R8C5-R9C6
//   M2 "Left R5":  up-right R5C1-R4C2-R3C3-R2C4-R1C5
//                  down-right R6C1-R7C2-R8C3-R9C4
//   M3 "Left R6":  up-right R6C1-R5C2-R4C3-R3C4-R2C5-R1C6
//                  down-right R7C1-R8C2-R9C3
//   M4 "Left R7":  up-right R7C1-R6C2-R5C3-R4C4-R3C5-R2C6-R1C7
//                  down-right R8C1-R9C2
//   M5 "Right R3": up-left R2C9-R1C8
//                  down-left R5C9-R6C8-R7C7-R8C6-R9C5
//   M6 "Right R5": up-left R4C9-R3C8-R2C7-R1C6
//                  down-left R7C9-R8C8-R9C7
//   M7 "Right R7": up-left R6C9-R5C8-R4C7-R3C6-R2C5-R1C4
//                  down-left R9C9 (single cell -- dropped, see below)
//
// M7's down-left ray is only the corner cell R9C9. A single grid digit is at
// most 9, but the cage-encoded total is 10*tens+ones with tens,ones both in
// 1-9, so it is at least 11: this branch can never balance for *any* digit
// assignment, not just the puzzle's answer, so it is omitted outright rather
// than encoded as a dead Or branch.
//
// Cages (each cage's first cell is the top/left one, matching "read left to
// right or downwards"):
//   G1 R2C5,R3C5   G2 R4C5,R5C5   G3 R6C5,R7C5   G4 R8C5,R9C5
//   G5 R4C3,R4C4   G6 R4C7,R5C7   G7 R5C8,R6C8
//
// The unknown marker<->cage bijection is reified with one Var per marker
// (holding one of the seven cage indices 1-7), forced all-different (7
// distinct values from a 7-value domain is automatically a full bijection,
// giving both halves of "exactly one cage per clue and vice versa"). Each
// marker's Or ranges over every (direction, cage) pair: the branch pins that
// marker's Var to the candidate cage index and asserts the arithmetic
// equation for that direction against that cage's two cells. No branch ever
// assigns a Var outside 1-7, so no extra top-level range restriction is
// needed on the Vars themselves.

const diagonals = {
  M1: {
    up: ['R3C1', 'R2C2', 'R1C3'],
    down: ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
  },
  M2: {
    up: ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
    down: ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  },
  M3: {
    up: ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'],
    down: ['R7C1', 'R8C2', 'R9C3'],
  },
  M4: {
    up: ['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'],
    down: ['R8C1', 'R9C2'],
  },
  M5: {
    up: ['R2C9', 'R1C8'],
    down: ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  },
  M6: {
    up: ['R4C9', 'R3C8', 'R2C7', 'R1C6'],
    down: ['R7C9', 'R8C8', 'R9C7'],
  },
  M7: {
    up: ['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'],
    // down: ['R9C9'] omitted -- see comment above, always unsatisfiable.
  },
};

const cages = {
  1: ['R2C5', 'R3C5'],
  2: ['R4C5', 'R5C5'],
  3: ['R6C5', 'R7C5'],
  4: ['R8C5', 'R9C5'],
  5: ['R4C3', 'R4C4'],
  6: ['R4C7', 'R5C7'],
  7: ['R5C8', 'R6C8'],
};

const markerNames = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];

const cageIndexVar = new Var('K', 'cage index chosen by each diagonal marker', 7);
const cageIndexCells = cageIndexVar.cells();

const diagonalCageOrs = markerNames.map((m, i) => {
  const varCell = cageIndexCells[i];
  const branches = [];
  for (const dir of Object.keys(diagonals[m])) {
    const cells = diagonals[m][dir];
    for (const k of Object.keys(cages)) {
      const [tens, ones] = cages[k];
      branches.push(new And([
        new Given(varCell, +k),
        new Sum(0, ...cells, [tens, -10], [ones, -1]),
      ]));
    }
  }
  return new Or(branches);
});

return [
  new Shape('9x9'),

  // White dots: consecutive digits.
  new WhiteDot('R2C6', 'R2C7'),
  new WhiteDot('R5C7', 'R5C8'),
  new WhiteDot('R7C7', 'R8C7'),
  new WhiteDot('R6C4', 'R6C5'),
  new WhiteDot('R3C3', 'R4C3'),

  // Auxiliary Vars: which cage (1-7) each of the 7 diagonal markers uses.
  cageIndexVar,
  new AllDifferent(...cageIndexCells),

  ...diagonalCageOrs,
];
