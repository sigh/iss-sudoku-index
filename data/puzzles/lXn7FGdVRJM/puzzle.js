// Title: Table Tennis Timeout
// Author: olima
// Video: https://www.youtube.com/watch?v=lXn7FGdVRJM
// Source: https://app.crackingthecryptic.com/sudoku/GnhgmHJH83

// Normal sudoku rules (default 3x3 boxes; no givens). Rules text:
// "Along thermos, digits increase from the bulb to the tip. Adjacent digits
// on a green line differ by at least 5. A purple line contains a set of
// consecutive numbers in any order. The digit sum on a blue line is equal in
// every box. A black dot joins digits with a 1:2 ratio; a white dot joins
// consecutive digits."
//
// Thermo = strictly increasing from the first cell (the bulb). Whisper
// (default difference 5) = the green-line rule. Renban = the purple-line
// rule. RegionSumLine = equal sum per box the line passes through (the
// blue-line rule). BlackDot/WhiteDot are the Kropki dots, both drawn
// between orthogonally adjacent cells.

// Two 2-cell diagonal thermometers; drawn bulb (grey circle underlay) first.
const thermos = [
  ['R3C4', 'R2C5'],
  ['R7C6', 'R8C5'],
].map(cells => new Thermo(...cells));

// Green (German whisper) lines. Drawn as three separate strokes: a row-5
// segment, a rectangular loop, and the loop's closing edge -- each stroke is
// encoded as its own Whisper over its own list-order pairs, so the
// rectangle's wrap-around edge (R2C4/R2C3) is covered exactly once by the
// closing-edge stroke.
const greenLines = [
  ['R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3'],
  ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R8C4', 'R8C5',
   'R8C6', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R2C6',
   'R2C5', 'R2C4'],
  ['R2C4', 'R2C3'],
].map(cells => new Whisper(...cells));

// Purple (Renban) lines: a set of consecutive digits in any order, so order
// within each cell list does not matter.
const purpleLines = [
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R8C9', 'R8C8', 'R9C8'],
  ['R1C2', 'R2C2', 'R2C1'],
].map(cells => new Renban(...cells));

// Blue line: equal digit sum per box. RegionSumLine splits the flat cell
// list by the box each cell belongs to and equates the per-box sums.
const blueLine = new RegionSumLine(
  'R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2');

// Kropki dots.
const whiteDot = new WhiteDot('R6C5', 'R6C6');
const blackDots = [
  ['R2C1', 'R3C1'],
  ['R7C9', 'R8C9'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...thermos,
  ...greenLines,
  ...purpleLines,
  blueLine,
  whiteDot,
  ...blackDots,
];
