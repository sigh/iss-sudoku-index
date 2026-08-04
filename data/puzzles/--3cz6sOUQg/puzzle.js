// Title: Borromean Rings
// Author: Allagem
// Video: https://www.youtube.com/watch?v=--3cz6sOUQg
// Source: https://app.crackingthecryptic.com/sudoku/78hbnfQjPm

// Normal sudoku rules (default rows/cols/boxes). Two killer cages (distinct +
// sum). Three rings, drawn as circles centred on a given digit: red alternates
// parity, green has adjacent difference >= 5, blue sums equally within each
// box it passes through.
//
// Each drawn circle (radius 2.15 cells) is a discretised 12-cell ring, not a
// filled disc: arc-length occupancy of the stroke is concentrated in 12 cells
// per ring and only grazes the 4 bounding-box corner cells (well under the
// established corner-graze threshold), so those corners are excluded. The
// centre cell (the given "2") is the ring's hub, not one of its 12 cells.

// Given digits, one at the centre of each ring (drawn `underlays`).
const givens = [
  ['R3C5', 2],
  ['R5C7', 2],
  ['R6C4', 2],
];

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [16, 'R1C8', 'R2C8', 'R2C9'],
  [19, 'R8C1', 'R8C2', 'R9C2'],
];

// Ring cell orders, walked in angular order around each ring's centre.
// Modular(2, ...) needs the wrap-around edge, so the first cell repeats at
// the end.
const redRing = [
  'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7',
  'R4C7', 'R5C6', 'R5C5', 'R5C4', 'R4C3', 'R3C3', 'R2C3',
];
const greenRing = [
  'R4C5', 'R3C6', 'R3C7', 'R3C8', 'R4C9', 'R5C9',
  'R6C9', 'R7C8', 'R7C7', 'R7C6', 'R6C5', 'R5C5', 'R4C5',
];
// RegionSumLine splits its cell list by walking it in order, so the start is
// rotated (relative to the ring's own angular order) to keep the ring's one
// box-run that straddles red/green's wrap point -- {R6C2, R5C2, R4C3} -- as a
// single trailing run instead of splitting it across the array ends.
const blueRing = [
  'R4C4', 'R4C5', 'R5C6', 'R6C6', 'R7C6', 'R8C5',
  'R8C4', 'R8C3', 'R7C2', 'R6C2', 'R5C2', 'R4C3',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new Modular(2, ...redRing),
  new Whisper(5, ...greenRing),
  new RegionSumLine(...blueRing),
];
