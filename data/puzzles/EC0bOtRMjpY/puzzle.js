// Title: Crimson Cut through the Green
// Author: NB
// Video: https://www.youtube.com/watch?v=EC0bOtRMjpY
// Source: https://sudokupad.app/hva096ojxs

// Standard sudoku (rows/cols/boxes) plus:
// - Cage: digits sum to the shown total, all cage digits distinct.
// - Green line (Whisper(5)): adjacent digits differ by at least 5.
// - Grey line: adjacent digits share one constant (signed) difference
//   along the whole line -- an arithmetic-progression line, encoded below
//   with a small NFA since ISS has no named class for it.
// - Arrow: arm digits sum to the circled digit.
// - X: adjacent digits sum to 10.
// - White dot: adjacent digits are consecutive.
// - Black dot: adjacent digits are in a 1:2 ratio.
// - Inequality: the pointed-to cell holds the lower digit.
// - Red line: the rules text withholds its rule ("clearing the fog reveals
//   how to complete it"). A caption embedded in the grid data at R6C4 --
//   invisible to a player until fog near it clears, but present in the
//   payload -- reads "region sum line / lowest possible / value". Read as
//   RegionSumLine: each 3x3-box segment of the path sums to the same total
//   (the path crosses 4 boxes, once each, with 3/2/3/3 cells per segment).
//   "Lowest possible value" is taken as a solving hint about that total,
//   not an extra rule.
// Fog/reveal state itself is solving UI, not encoded (foglight cage
// markers in the source payload are the same UI and are skipped).
//
// Nothing else is omitted.

const givens = [
  new Given('R5C5', 1),
];

const cages = [
  new Cage(18, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(18, 'R1C8', 'R2C8', 'R3C8'),
  new Cage(9, 'R7C2', 'R8C2'),
  new Cage(9, 'R7C8', 'R8C8'),
  new Cage(8, 'R9C5', 'R9C6'),
];

const greenLines = [
  ['R6C8', 'R7C8', 'R8C8'],
  ['R6C2', 'R7C2', 'R8C2', 'R8C3', 'R9C3'],
  ['R4C2', 'R3C2', 'R3C3'],
  ['R3C7', 'R3C8', 'R4C8'],
  ['R1C4', 'R1C3', 'R2C3'],
].map(cells => new Whisper(5, ...cells));

// Arithmetic-progression NFA: every consecutive pair on the line shares one
// signed difference (the value fixed by the first pair, then held for the
// rest of the line). Matches ISS's own "AP" sandbox example.
const apSpec = NFA.encodeSpec({
  startState: { lastVal: null, diff: null },
  transition: ({ lastVal, diff }, value) => {
    if (lastVal === null) return { lastVal: value, diff };
    const newDiff = value - lastVal;
    if (diff === null || diff === newDiff) {
      return { lastVal: value, diff: newDiff };
    }
  },
  accept: () => true,
}, /* numValues= */ 9);
const greyLine = new NFA(apSpec, 'AP', 'R5C6', 'R6C6', 'R7C6');

const arrow = new Arrow('R6C6', 'R7C7');

const xPairs = [
  ['R5C3', 'R5C4'],
  ['R1C9', 'R2C9'],
].map(cells => new X(...cells));

const whiteDots = [
  ['R9C4', 'R9C5'],
  ['R2C5', 'R3C5'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R4C4', 'R4C5'],
  ['R4C5', 'R4C6'],
  ['R2C2', 'R3C2'],
  ['R2C8', 'R3C8'],
].map(cells => new BlackDot(...cells));

// Each GreaterThan lists the larger cell first, then its adjacent smaller
// neighbours, one call per cluster of chevrons pointing at the same cell.
const inequalities = [
  new GreaterThan('R1C2', 'R1C1', 'R1C3', 'R2C2'),
  new GreaterThan('R1C8', 'R1C7', 'R1C9', 'R2C8'),
];

const redLine = new RegionSumLine(
  'R8C1', 'R8C2', 'R7C3', 'R7C4', 'R7C5', 'R6C5', 'R5C5', 'R4C4', 'R3C4',
  'R2C5', 'R1C6');

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...greenLines,
  greyLine,
  arrow,
  ...xPairs,
  ...whiteDots,
  ...blackDots,
  ...inequalities,
  redLine,
];
