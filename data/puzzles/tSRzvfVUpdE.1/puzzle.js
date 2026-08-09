// Title: September 19, 2022: Cage Twins
// Author: clover!
// Video: https://www.youtube.com/watch?v=tSRzvfVUpdE
// Source: https://tinyurl.com/v56suh66
//
// Normal sudoku rules apply. Every digit that appears in a cage must appear
// exactly twice in that cage (never once, three, or more times); the cages
// carry no printed totals.

const givens = [
  ['R1C3', 1], ['R2C4', 2], ['R3C3', 3], ['R4C4', 4], ['R5C5', 5],
  ['R6C6', 6], ['R7C7', 7], ['R8C6', 8], ['R9C7', 9],
].map(([cell, value]) => new Given(cell, value));

// Transcribed from the source's outlined (total-less) cage array.
const cages = [
  ['R1C2', 'R1C3', 'R1C4', 'R2C2', 'R2C4', 'R3C4'],
  ['R2C3', 'R3C3', 'R3C5', 'R4C3', 'R4C4', 'R4C5'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R6C5', 'R6C6', 'R6C7', 'R7C5', 'R7C7', 'R8C7'],
  ['R7C6', 'R8C6', 'R8C8', 'R9C6', 'R9C7', 'R9C8'],
];

// Tracks, per digit, whether it has been seen 0/1/2+ times so far within a
// cage; rejects a 3rd occurrence; accepts only if no digit is left at
// exactly 1 occurrence -- equivalent to "every digit that appears, appears
// exactly twice".
const cageTwinsSpec = {
  startState: { onceMask: 0, twiceMask: 0 },
  transition({ onceMask, twiceMask }, value) {
    const bit = 1 << value;
    if (twiceMask & bit) return undefined;
    if (onceMask & bit) return { onceMask: onceMask & ~bit, twiceMask: twiceMask | bit };
    return { onceMask: onceMask | bit, twiceMask };
  },
  accept: ({ onceMask }) => onceMask === 0,
  maxDepth: 6,
};
const cageTwinsMachine = NFA.encodeSpec(cageTwinsSpec, 9);

return [
  new Shape('9x9'),
  ...givens,
  ...cages.map(cage => new NFA(cageTwinsMachine, 'cage-twins', cage)),
];
