// Title: Raw Fog of War
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=PdhremlODmI
// Source: https://sudokupad.app/nGb8TFpQ6h

// Normal 4x4 Sudoku rules apply. The grey line is a palindrome, and every
// digit on it equals its total number of occurrences there. Fog is UI-only.
// A nine-cell palindrome satisfying the count rule has centre 3 and outer
// half a permutation of 2, 3, 4, 4; each alternative below includes its mirror.
const outerHalves = [
  '2344', '2434', '2443', '3244', '3424', '3442',
  '4234', '4243', '4324', '4342', '4423', '4432',
];
const countedPalindromes = outerHalves
  .map((half) => `${half}3${[...half].reverse().join('')}`)
  .join('|');

// Drawn grey-line cells, transcribed in its orthogonal traversal order.
const greyLine = [
  'R1C4', 'R2C4', 'R2C3', 'R3C3', 'R4C3',
  'R4C2', 'R3C2', 'R3C1', 'R2C1',
];

return [
  new Shape('4x4'),
  new Regex(countedPalindromes, ...greyLine),
];
