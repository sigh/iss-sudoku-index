// Title: Regional Differences
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=kDO6GlPK_48
// Source: https://app.crackingthecryptic.com/sudoku/97Lq8qnJmj

// Normal Sudoku rules apply. Each blue line has equal digit sums in every box
// portion it crosses. White dots join lines whose region sums differ by one;
// black dots join lines whose region sums have a 1:2 ratio.
// Blue-line paths and dot-adjacent portions are transcribed from the drawn data.
const lines = [
  ['R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R2C4'],
  ['R2C8', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R5C9', 'R6C9'],
  ['R6C8', 'R7C9', 'R8C9', 'R9C9'],
  ['R4C7', 'R5C8', 'R6C7', 'R7C6', 'R7C5', 'R7C4', 'R6C3', 'R5C3', 'R4C3'],
  ['R1C1', 'R1C2', 'R2C3', 'R3C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R5C6', 'R4C6'],
  ['R5C5', 'R4C5', 'R3C4', 'R3C5', 'R3C6', 'R2C6'],
  ['R2C1', 'R3C1', 'R4C1', 'R4C2'],
  ['R5C2', 'R6C2', 'R7C1', 'R8C1'],
  ['R8C2', 'R9C3', 'R9C4', 'R8C4'],
  ['R9C5', 'R8C5', 'R8C6', 'R7C7', 'R8C7', 'R9C8'],
];

// These machines scan the two dot-adjacent box portions, accumulating first
// minus second; SEGMENT_BREAK changes from the first portion to the second.
const consecutiveSums = NFA.encodeSpec({
  startState: { sum: 0, side: 1 },
  transition: ({ sum, side }, value) => value === SEGMENT_BREAK
    ? (side === 1 ? { sum, side: -1 } : undefined)
    : { sum: sum + side * value, side },
  accept: ({ sum, side }) => side === -1 && Math.abs(sum) === 1,
  maxDepth: 11,
}, 9, { multiSegment: true });
const ratioSums = NFA.encodeSpec({
  startState: { first: 0, second: 0, side: 1 },
  transition: ({ first, second, side }, value) => value === SEGMENT_BREAK
    ? (side === 1 ? { first, second, side: -1 } : undefined)
    : side === 1 ? { first: first + value, second, side }
      : { first, second: second + value, side },
  accept: ({ first, second, side }) => side === -1
    && (first === 2 * second || second === 2 * first),
  maxDepth: 11,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
  new NFA(consecutiveSums, 'white dot R2C6-R2C7',
    ['R3C4', 'R3C5', 'R3C6', 'R2C6'], ['R2C8', 'R2C7', 'R3C7', 'R3C8']),
  new NFA(consecutiveSums, 'white dot R7C5-R8C5',
    ['R7C6', 'R7C5', 'R7C4'], ['R9C5', 'R8C5', 'R8C6']),
  new NFA(ratioSums, 'black dot R6C8-R6C9',
    ['R6C8'], ['R4C8', 'R5C9', 'R6C9']),
  new NFA(ratioSums, 'black dot R8C1-R8C2',
    ['R7C1', 'R8C1'], ['R8C2', 'R9C3']),
  new NFA(ratioSums, 'black dot R4C2-R5C2',
    ['R4C1', 'R4C2'], ['R5C2', 'R6C2']),
  new NFA(ratioSums, 'black dot R4C5-R4C6',
    ['R5C5', 'R4C5'], ['R4C4', 'R5C4', 'R6C4', 'R6C5', 'R5C6', 'R4C6']),
  new NFA(ratioSums, 'black dot R2C8-R2C9',
    ['R2C8', 'R2C7', 'R3C7', 'R3C8'], ['R2C9', 'R1C9', 'R1C8', 'R1C7']),
];
