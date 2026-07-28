// Title: Decoy Snail
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=HYq6jNh7WAk
// Source: https://sudokupad.app/fleyhg6tnu

// Encoded rules:
//  - Standard 9x9 sudoku. The drawn regions are the ordinary 3x3 boxes, so the
//    default Shape boxes are used.
//  - "Mangoes separate two consecutive digits" -- Kropki white dot.
//  - "Coconuts separate two digits where one is double the other" -- Kropki
//    black dot.
//  - "Not all fruit has been given", so an unmarked edge is unconstrained: no
//    negative constraint accompanies the dots.
//  - "ALL Golden Coins ... represent an almost complete set of the digits 1-9
//    (excepting, of course, the poison digit)". Eight coins are drawn and the
//    named set has eight members, so the eight coin digits are all different.
//
// Omitted rules (each is stated in the rules text and is not encoded here):
//  - Chiki's path: an undrawn route through cell centres taking orthogonal or
//    diagonal steps, never revisiting or crossing itself.
//  - The bright blue maze walls, which constrain only that path.
//  - The segmentation of the path at box borders into strictly increasing
//    thermometers.
//  - The order in which the coins are collected (low to high along the path).
//    Only the all-different consequence above is kept.
//  - The poison digit that the path must avoid, and the decoy-snail clause.

// Fruit icons are drawn straddling a cell edge; each pair below is the two
// cells that icon sits between.
const mangoes = [
  ['R1C1', 'R1C2'],
  ['R1C1', 'R2C1'],
  ['R7C9', 'R8C9'],
];
const coconuts = [
  ['R1C2', 'R1C3'],
  ['R2C1', 'R3C1'],
  ['R8C8', 'R9C8'],
];

// The eight cells carrying a gold coin disc.
const coins = [
  'R1C1', 'R1C9', 'R2C6', 'R2C8',
  'R3C3', 'R4C4', 'R6C3', 'R8C4',
];

return [
  new Shape('9x9'),

  ...mangoes.map((pair) => new WhiteDot(...pair)),
  ...coconuts.map((pair) => new BlackDot(...pair)),

  new AllDifferent(...coins),
];
