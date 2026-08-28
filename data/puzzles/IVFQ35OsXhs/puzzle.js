// Title: A Grandmaster Sudoku
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=IVFQ35OsXhs
// Source: https://cracking-the-cryptic.web.app/sudoku/7Qh3tBm4mj
//
// Normal sudoku rules apply. A grey bar between two orthogonally adjacent
// cells means those digits are consecutive. Not all possible bars are
// drawn -- an unmarked adjacent pair carries no information (StrictKropki
// does not apply). Modelled as one WhiteDot per drawn bar.

const givens = [
  new Given('R9C5', 1),
];

// Grey consecutive bars, transcribed from the payload's underlay rectangles
// (narrow/tall = horizontally-adjacent pair, wide/short = vertically-adjacent
// pair).
const whiteDots = [
  ['R2C3', 'R2C4'], ['R3C3', 'R3C4'], ['R1C5', 'R1C6'], ['R3C5', 'R3C6'],
  ['R4C5', 'R4C6'], ['R4C6', 'R4C7'], ['R3C7', 'R3C8'], ['R4C8', 'R4C9'],
  ['R6C4', 'R6C5'], ['R7C4', 'R7C5'], ['R6C1', 'R6C2'], ['R6C2', 'R6C3'],
  ['R7C2', 'R7C3'], ['R9C3', 'R9C4'], ['R9C4', 'R9C5'], ['R8C6', 'R8C7'],
  ['R7C7', 'R7C8'],
  ['R1C3', 'R2C3'], ['R1C5', 'R2C5'], ['R1C6', 'R2C6'], ['R2C6', 'R3C6'],
  ['R3C6', 'R4C6'], ['R4C6', 'R5C6'], ['R6C2', 'R7C2'], ['R7C4', 'R8C4'],
  ['R6C4', 'R7C4'], ['R5C4', 'R6C4'], ['R8C7', 'R9C7'], ['R7C7', 'R8C7'],
  ['R6C7', 'R7C7'], ['R2C8', 'R3C8'], ['R3C8', 'R4C8'], ['R4C8', 'R5C8'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
];
