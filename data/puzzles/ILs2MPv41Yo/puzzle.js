// Title: Which Direction?
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=ILs2MPv41Yo
// Source: https://app.crackingthecryptic.com/sudoku/NgrqfFtmGB

// Rules encoded here:
//  - Normal sudoku.
//  - Seven "?" clues sit outside the grid, each with two arrows drawn from it
//    into the grid. One of the two indicated diagonals is the clue's real
//    diagonal; the digits along it (repeats allowed) sum to a two-digit
//    number, and that number is the pair of digits held by one killer cage,
//    read left to right for a horizontal cage and downwards for a vertical one.
//  - One killer cage belongs to exactly one diagonal clue and vice versa
//    (a bijection between the seven "?" clues and the seven cages).
//  - White dots mark consecutive neighbours; not all dots are given, so there
//    is no negative dot constraint.
//
// Omitted: "Each diagonal clue is only valid in ONE of the two possible ways."
// The encoding requires at least one of a clue's two diagonals to match its
// cage; it does not forbid the other diagonal from also matching.
//
// The killer cages carry no totals. Each cage's two cells share a row or a
// column, so sudoku already forbids a repeat inside it; no extra cage
// constraint is added.

// Each "?" sits in the margin cell beside a row; its two arrows point into the
// grid along the two diagonals that start from the grid corner just above and
// just below that margin cell. Transcribed from the drawn arrow directions.
const diagonalClues = [
  {  // "?" left of R3
    name: 'left R3',
    up: ['R2C1', 'R1C2'],
    down: ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
  },
  {  // "?" left of R5
    name: 'left R5',
    up: ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
    down: ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  },
  {  // "?" left of R6
    name: 'left R6',
    up: ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
    down: ['R7C1', 'R8C2', 'R9C3'],
  },
  {  // "?" left of R7
    name: 'left R7',
    up: ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'],
    down: ['R8C1', 'R9C2'],
  },
  {  // "?" right of R3
    name: 'right R3',
    up: ['R2C9', 'R1C8'],
    down: ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'],
  },
  {  // "?" right of R5
    name: 'right R5',
    up: ['R4C9', 'R3C8', 'R2C7', 'R1C6'],
    down: ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  },
  {  // "?" right of R7
    name: 'right R7',
    up: ['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'],
    down: ['R8C9', 'R9C8'],
  },
];

// The seven drawn killer cages, each listed in its reading order: downwards for
// the six vertical cages, left to right for the one horizontal cage (R4C3-R4C4).
// The first cell is the tens digit of the cage's two-digit number.
const cages = [
  ['R2C5', 'R3C5'],
  ['R4C5', 'R5C5'],
  ['R6C5', 'R7C5'],
  ['R8C5', 'R9C5'],
  ['R4C3', 'R4C4'],
  ['R4C7', 'R5C7'],
  ['R5C8', 'R6C8'],
];

// The drawn white dots.
const whiteDots = [
  ['R2C6', 'R2C7'],
  ['R5C7', 'R5C8'],
  ['R7C7', 'R8C7'],
  ['R6C4', 'R6C5'],
  ['R3C3', 'R4C3'],
];

// One Var per "?" clue holding the index (1..7) of the cage it is paired with.
// AllDifferent over the seven Vars is the one-cage-per-clue bijection: without
// it the per-clue Or would let two clues claim the same cage.
const pairing = new Var('P', 'Cage paired with each diagonal clue', cages.length);

// sum(diagonal) = 10 * tens + ones, as one linear equation. A cell appearing on
// both sides (a diagonal that crosses its own cage) just combines coefficients.
const diagonalEqualsCage = (diagonal, [tens, ones]) =>
  new Sum(0, ...diagonal, [tens, -10], [ones, -1]);

return [
  new Shape('9x9'),

  pairing,
  ...pairing.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7)),
  new AllDifferent(...pairing.cells()),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  ...diagonalClues.map((clue, i) => new Or(
    cages.flatMap((cage, j) =>
      [clue.up, clue.down].map(diagonal => new And([
        diagonalEqualsCage(diagonal, cage),
        new Given(pairing.cell(i + 1), j + 1),
      ]))))),
];
