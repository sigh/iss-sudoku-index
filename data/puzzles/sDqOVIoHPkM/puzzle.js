// Title: What Number Am I Thinking Of? (XVI)
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=sDqOVIoHPkM
// Source: https://sudokupad.app/gkeyid12bp

// Pick five digits from 1-9 and place that same set of five digits in every
// row, column, and jigsaw region: a widened 1-9 alphabet with RegionSameValues
// over the size-5 rows/columns/pieces. Grey-square cells hold an even digit.
// Black dots are a 1:2 ratio.
//
// Anti-King: "cells a king's move away from a cell marked by a star can't
// contain the same digit" names one reference cell (the star) and reads as a
// pairwise rule between that cell and each of its king-neighbours -- not a
// mutual all-different among the neighbours themselves, since only the star
// is identified as a fixed point in the sentence.

// Jigsaw regions -- from the puzzle's own `regions` array (5 pentominoes
// tiling the 5x5 grid); these are the "box" referred to in the rules text.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C5'],
  ['R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3'],
  ['R3C1', 'R4C1', 'R4C2', 'R5C1', 'R5C2'],
  ['R4C4', 'R4C5', 'R5C3', 'R5C4', 'R5C5'],
];

// Star mark: drawn as an 8-pointed star underlay centred on R3C3.
const star = 'R3C3';
const kingNeighbours = [
  'R2C2', 'R2C3', 'R2C4',
  'R3C2', 'R3C4',
  'R4C2', 'R4C3', 'R4C4',
];

// Grey-square underlays (parity) -- at the four grid corners.
const greySquares = ['R1C1', 'R1C5', 'R5C1', 'R5C5'];

// Black Kropki dots -- edge overlays between the cell pairs below.
const blackDots = [
  ['R4C1', 'R4C2'],
  ['R4C2', 'R5C2'],
  ['R1C2', 'R1C3'],
];

return [
  new Shape('5x5', 9),
  ...regions.map(cells => new Jigsaw('5x5', ...cells)),
  new RegionSameValues(),
  // Each is a plain two-cell all-different, i.e. "not equal to the star".
  ...kingNeighbours.map(c => new AllDifferent(star, c)),
  ...greySquares.map(c => new Given(c, 2, 4, 6, 8)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
