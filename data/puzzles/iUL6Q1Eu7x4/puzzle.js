// Title: Campfire
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=iUL6Q1Eu7x4
// Source: https://app.crackingthecryptic.com/sudoku/n4LPm2h3fD

// Rules: Normal sudoku rules apply. For each line, digits on that line have
// an equal sum within each box the line passes through. Cells separated by
// a white dot contain consecutive digits. Cells separated by a black dot
// contain digits in a 1:2 ratio.
//
// Standard 9x9 with the default box regions (the drawn regions match the
// ordinary 3x3 boxes, confirmed by inspection), so no NoBoxes/Jigsaw needed.
// No givens; no printed cage totals (the puzzle carries metadata stubs --
// title/author/rules/blank -- but no drawn cages).
//
// "equal sum within each box the line passes through" is exactly
// RegionSumLine's documented semantics; pass each line's full ordered cell
// list and let the class split by box crossing itself.
//
// White dot = consecutive (WhiteDot), black dot = 1:2 ratio (BlackDot) --
// both native classes with exactly this wording in their DESCRIPTION.
// The rules text never says all dots are drawn (no "not all" nor an "all
// dots are marked" biconditional), so only the 7 drawn dots are encoded;
// no negative constraint on unmarked adjacent pairs.

// Line cell lists: waypoints are cell-centre half-integers; consecutive
// waypoints that are not orthogonally/diagonally adjacent (a straight run)
// are interpolated to the intermediate cells. Table below transcribed from
// the source's drawn line waypoints (one line has no waypoints and renders
// nothing, so it is excluded).
const regionSumLines = [
  ['R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C2', 'R7C3'],
  ['R4C2', 'R5C2', 'R5C3', 'R4C3', 'R3C4', 'R2C4'],
  ['R2C6', 'R3C6', 'R4C7', 'R5C7', 'R5C8', 'R4C8'],
  ['R7C7', 'R7C8', 'R6C9', 'R5C9', 'R4C9', 'R3C8', 'R2C8'],
  ['R9C2', 'R8C3', 'R8C4', 'R7C5', 'R8C6', 'R8C7', 'R9C8'],
];

// Dot cell pairs: transcribed from the source's drawn edge-centred overlay
// markers, split by fill colour. White = consecutive, black = ratio.
const whiteDots = [
  ['R2C3', 'R3C3'],
  ['R2C7', 'R3C7'],
  ['R4C3', 'R4C4'],
  ['R4C6', 'R4C7'],
  ['R8C5', 'R9C5'],
];
const blackDots = [
  ['R8C1', 'R9C1'],
  ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
