// Title: Jan 18, 2022: Corner/Edge
// Author: clover!
// Video: https://www.youtube.com/watch?v=g0fQoSHld5Y
// Source: https://tinyurl.com/9fx3h93y

// Standard sudoku (rows/columns/boxes) plus eight Corner/Edge clues. Each
// clue names a box and a digit set; every digit in the set must appear
// somewhere among that box's own four corner cells (its four "C" labels)
// or its own four edge cells (its "E" labels). ContainAtLeast enforces
// "each named digit appears at least once among the named cells", which is
// the rule as stated; box all-different already forbids any digit
// appearing twice among any subset of the box, so this is equivalently
// "each named digit appears exactly once" without asserting an exact count
// directly. The centre box carries no clue (8 printed clues for 9 boxes).
// Text-to-box mapping and the
// corner/edge cell lists are given by the rules' own worked example
// ("E 56" next to the middle-left box -> R4C2, R5C1, R5C3, R6C2), which
// matches this puzzle's own "E 56" clue and cells exactly.
const givens = [
  ['R1C5', 6], ['R3C3', 4], ['R3C5', 7], ['R3C7', 2],
  ['R4C4', 7], ['R4C6', 2], ['R5C1', 8], ['R5C3', 7],
  ['R5C7', 3], ['R5C9', 5], ['R6C4', 1], ['R6C6', 5],
  ['R7C3', 9], ['R7C5', 4], ['R7C7', 5], ['R9C5', 1],
];

// Corner/edge clues: [digit set, cells]. Digit sets are read digit-by-digit
// (single-digit alphabet, so no ambiguity splitting the printed string).
const clues = [
  ['1_2_3', ['R1C1', 'R1C3', 'R3C1', 'R3C3']], // C 123, top-left box corners
  ['1_4', ['R1C5', 'R2C4', 'R2C6', 'R3C5']],    // E 14, top-middle box edges
  ['1_4_9', ['R1C7', 'R1C9', 'R3C7', 'R3C9']],  // C 149, top-right box corners
  ['5_6', ['R4C2', 'R5C1', 'R5C3', 'R6C2']],    // E 56, middle-left box edges
  ['8_9', ['R4C8', 'R5C7', 'R5C9', 'R6C8']],    // E 89, middle-right box edges
  ['1_5_8', ['R7C1', 'R7C3', 'R9C1', 'R9C3']],  // C 158, bottom-left box corners
  ['2_3', ['R7C5', 'R8C4', 'R8C6', 'R9C5']],    // E 23, bottom-middle box edges
  ['2_6_7', ['R7C7', 'R7C9', 'R9C7', 'R9C9']],  // C 267, bottom-right box corners
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...clues.map(([values, cells]) => new ContainAtLeast(values, ...cells)),
];
