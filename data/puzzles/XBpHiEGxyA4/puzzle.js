// Title: Mediocrity
// Author: fuxia
// Video: https://www.youtube.com/watch?v=XBpHiEGxyA4
// Source: https://app.crackingthecryptic.com/sudoku/Pm8N43nTMG

// Normal sudoku rules apply (standard rows/cols/boxes from Shape('9x9')).
//
// Inequality signs: a chevron drawn on a cell edge points to the smaller
// digit of the two cells sharing that edge (rules text). Every drawn
// chevron is encoded once as GreaterThan(biggerCell, smallerCell); only
// the 22 edges that carry a drawn chevron are constrained.
//
// Clone dominoes: two same-coloured 1x2 underlay dominoes are clones --
// "the same digits at the same position in the domino" (rules text). Each
// same-coloured pair shares one axis (chocolate = vertical, blue =
// horizontal), so "position" is unambiguous: read both top-to-bottom
// (vertical) or left-to-right (horizontal). Each positional pair is forced
// equal with SameValues(2, cellA, cellB) -- a 2-cell/2-set call, so each
// set is a singleton and the two cells must hold the same digit.
//
// White dots: drawn dot -> WhiteDot (consecutive), adjacent cells only.
// "Not all possible white dots are given" means the converse does not
// hold: undotted adjacent pairs are not constrained, so only the 3 drawn
// dots are encoded.

// Chocolate domino A: R1C2 (top) / R2C2 (bottom).
// Chocolate domino B: R8C8 (top) / R9C8 (bottom).
// Blue domino C: R4C6 (left) / R4C7 (right).
// Blue domino D: R6C3 (left) / R6C4 (right).
// Domino cells and colours come from the drawn 1x1 underlay shapes: R1C2/
// R2C2, R8C8/R9C8 chocolate (#EB7532); R4C6/R4C7, R6C3/R6C4 blue (#34BBE6).
const cloneDominoes = [
  new SameValues(2, 'R1C2', 'R8C8'),
  new SameValues(2, 'R2C2', 'R9C8'),
  new SameValues(2, 'R4C6', 'R6C3'),
  new SameValues(2, 'R4C7', 'R6C4'),
];

// Inequality chevrons, transcribed from the drawn text overlays ('<' '>'
// '^' 'v', coloured to match their nearby domino) by the edge each
// overlay's offset center sits on and the direction its glyph points.
const inequalities = [
  new GreaterThan('R1C2', 'R1C1'),
  new GreaterThan('R1C2', 'R1C3'),
  new GreaterThan('R2C2', 'R2C1'),
  new GreaterThan('R2C2', 'R2C3'),
  new GreaterThan('R2C2', 'R3C2'),
  new GreaterThan('R8C9', 'R8C8'),
  new GreaterThan('R8C7', 'R8C8'),
  new GreaterThan('R7C8', 'R8C8'),
  new GreaterThan('R9C9', 'R9C8'),
  new GreaterThan('R9C7', 'R9C8'),
  new GreaterThan('R4C5', 'R4C6'),
  new GreaterThan('R3C6', 'R4C6'),
  new GreaterThan('R5C6', 'R4C6'),
  new GreaterThan('R4C8', 'R4C7'),
  new GreaterThan('R3C7', 'R4C7'),
  new GreaterThan('R5C7', 'R4C7'),
  new GreaterThan('R6C3', 'R6C2'),
  new GreaterThan('R6C3', 'R5C3'),
  new GreaterThan('R6C3', 'R7C3'),
  new GreaterThan('R6C4', 'R6C5'),
  new GreaterThan('R6C4', 'R5C4'),
  new GreaterThan('R6C4', 'R7C4'),
];

// White dots (consecutive): rounded white-filled, black-bordered,
// edge-sized marks with no text.
const whiteDots = [
  new WhiteDot('R3C3', 'R3C4'),
  new WhiteDot('R5C1', 'R5C2'),
  new WhiteDot('R9C5', 'R9C6'),
];

return [
  new Shape('9x9'),
  ...cloneDominoes,
  ...inequalities,
  ...whiteDots,
];
