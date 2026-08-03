// Title: 6th Anniversary CTC
// Author: Jodawo & Panthera
// Video: https://www.youtube.com/watch?v=CuSUafLxk7k
// Source: https://app.crackingthecryptic.com/sudoku/JhrhQh9G3M
//
// Normal sudoku rules apply. Neighbouring digits along a green line must have
// a difference of at least 5 (Whisper(5)). Cells along a purple line must be
// a set of consecutive digits in any order (Renban). Four cages carry the
// totals 6, 8, 17, and 26 between them; which cage gets which total is for
// the solver to work out. The two size-2 cages read as two-digit numbers:
// rules text "(reading order is left-to-right or up-to-down)" fixes each
// cage's own reading direction from its drawn orientation (R7C1-R8C1 runs
// top-to-bottom, R6C8-R6C9 runs left-to-right); it is only the assignment of
// {6,8} to the two single-cell cages and {17,26} to the two two-cell cages
// that is left open.

// Purple lines: each drawn stroke traces one full 2x2 corner block.
const renbanLoops = [
  ['R2C2', 'R2C1', 'R1C1', 'R1C2'], // top-left corner block
  ['R2C8', 'R1C8', 'R1C9', 'R2C9'], // top-right corner block
  ['R8C8', 'R8C9', 'R9C9', 'R9C8'], // bottom-right corner block
  ['R8C2', 'R9C2', 'R9C1', 'R8C1'], // bottom-left corner block
].map(cells => new Renban(...cells));

// Green lines: 10 separately drawn strokes; no cell is shared between two of
// them, so each stroke is its own Whisper(5) segment.
const whisperSegments = [
  ['R3C6', 'R3C5', 'R3C4'],
  ['R3C7', 'R4C6'],
  ['R2C6', 'R1C7'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R4C7', 'R5C7', 'R6C7'],
  ['R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R7C3', 'R6C4'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R9C6', 'R9C5', 'R9C4'],
].map(cells => new Whisper(5, ...cells));

// The two single-cell cages: a one-cell total is necessarily one digit, so it
// must be 6 or 8 (17/26 need two digits). Which cell is 6 and which is 8 is
// left to the solver; both cells sit in column 3, so ordinary column
// all-different already forces them apart -- no extra constraint needed.
// Drawn cages: the lone cells R3C3 and R5C3.
const singleCellCages = [
  new Given('R3C3', 6, 8),
  new Given('R5C3', 6, 8),
];

// The two two-cell cages: a two-cell total is necessarily two digits, so it
// must be 17 or 26 (6/8 need one digit); the only digit pairs that read as
// 17 or 26 are (1,7) and (2,6). One Or fixes both cages' readings together so
// the two totals land on different cages, as the rules require.
// Drawn cages: R7C1-R8C1 (read top-to-bottom) and R6C8-R6C9 (read
// left-to-right).
const twoCellCages = new Or([
  new And([
    new Given('R7C1', 1), new Given('R8C1', 7), // R7C1-R8C1 reads 17
    new Given('R6C8', 2), new Given('R6C9', 6), // R6C8-R6C9 reads 26
  ]),
  new And([
    new Given('R7C1', 2), new Given('R8C1', 6), // R7C1-R8C1 reads 26
    new Given('R6C8', 1), new Given('R6C9', 7), // R6C8-R6C9 reads 17
  ]),
]);

return [
  new Shape('9x9'),
  ...renbanLoops,
  ...whisperSegments,
  ...singleCellCages,
  twoCellCages,
];
