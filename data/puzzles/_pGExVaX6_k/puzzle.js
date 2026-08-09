// Title: Woodland Snowfall
// Author: fjam
// Video: https://www.youtube.com/watch?v=_pGExVaX6_k
// Source: https://app.crackingthecryptic.com/sudoku/2J9BH6RrFQ

// Normal sudoku rules apply (default 9x9 with 3x3 boxes, no givens).
// Green lines: adjacent digits along the line differ by at least 5
// (Whisper). White dots: adjacent digits consecutive. Black dots: adjacent
// digits in ratio 1:2. "Not all dots are given" is the standard Kropki
// negative-omission note: undotted adjacent pairs are unconstrained, so no
// negative constraint is added.

// Each green line is drawn as a single branching stroke that revisits some
// of its own cells (tree-shaped), not a simple path. Whisper binds
// consecutive pairs by list order, so passing the walked cell sequence
// (including the cells it revisits) reproduces every drawn segment exactly
// once, branches included.
const greenLines = [
  ['R9C3', 'R8C3', 'R8C4', 'R7C3', 'R7C2', 'R6C3', 'R7C4', 'R7C3', 'R8C2', 'R8C3'],
  ['R5C4', 'R4C4', 'R4C3', 'R3C4', 'R3C3', 'R2C4', 'R3C5', 'R3C4', 'R4C5', 'R4C4'],
  ['R8C7', 'R7C7', 'R7C8', 'R6C7', 'R6C8', 'R5C7', 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
].map(cells => new Whisper(5, ...cells));

// Provenance: the edge-sized white/black rounded overlays.
const whiteDots = [
  ['R1C9', 'R2C9'], ['R2C7', 'R3C7'], ['R2C5', 'R3C5'], ['R1C3', 'R2C3'],
  ['R4C1', 'R5C1'], ['R6C2', 'R7C2'], ['R7C4', 'R8C4'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R5C4', 'R6C4'], ['R8C7', 'R9C7'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...greenLines,
  ...whiteDots,
  ...blackDots,
];
