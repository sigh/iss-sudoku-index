// Title: Sort by Size
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=lpiBE1b4sls
// Source: https://sudokupad.app/70njbfg1zs

// Isofill: divide the grid into 9 orthogonally-connected 9-cell regions, all
// cells in a region sharing one digit, every digit 1-9 appearing somewhere.
// No boxes, rows or columns are given any uniqueness rule (the video's own
// warning: "don't try and do sudoku with this one"), so the grid is Raw and
// carries no implicit row/column/box constraints -- only what is stated
// below. With exactly 9 regions and the requirement that every digit 1-9
// appears, each region's digit is forced to be distinct from every other
// region's, but that is a consequence of the constraints below, not a
// separate rule to encode: for each digit d, ConnectedValues asserts the
// cells holding d are non-empty (so every digit appears), form exactly one
// orthogonally-connected region, and that region has exactly 9 cells. Doing
// this for every digit 1-9 partitions all 81 cells (9 * 9 = 81) into the 9
// monochromatic regions the rules describe.
//
// Entropic lines (peach) and thermometers (white/grey, round bulb) are
// listed below with a one-line provenance comment each, read off the drawn
// waypoints (0-indexed [row, col] cell centres, converted to 1-indexed
// R#C# ids). Thermometer cell order is bulb-to-tip; sudokupad draws one of
// the four (R2C1-R2C2) tip-first, with the bulb overlay circle on R2C2, so
// that line is listed in reverse of its drawn waypoint order.
//
// A small set of black hairline/corner overlays sits exactly on interior
// cell borders and diagonal crossings that lie along these same
// thermometer and entropic-line paths. They are read as leftover pieces of
// the puzzle's own redrawn grid (the interior grid is otherwise redrawn as
// plain black lines covering 100% of interior edges, a `setting-nogrid`
// puzzle's cosmetic grid, not a wall or region-border clue) rendered where
// the thick coloured lines cross the grid, not an independent clue: the
// rules text has exactly the three paragraphs encoded here and never
// mentions a drawn border or wall.

const SHAPE = new Shape('9x9', '1-9', 'Raw');

// Isofill regions: for each digit, its cells are exactly one
// orthogonally-connected 9-cell region.
const isofillRegions = Array.from(
  { length: 9 }, (_, i) => new ConnectedValues('', i + 1, 9));

// Entropic lines (peach-coloured), 3 cells each, read as R2C5-R2C6-R3C7,
// R1C7-R1C8-R1C9, and R6C6-R7C6-R8C7 (order within a 3-cell entropic line
// does not matter).
const entropicLines = [
  ['R2C5', 'R2C6', 'R3C7'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R6C6', 'R7C6', 'R8C7'],
].map(cells => new Entropic(...cells));

// Thermometers (white/grey, each bulb end marked by a circle overlay),
// bulb cell listed first: R5C6->R4C7, R6C9->R7C9,
// R8C4->R8C3->R8C2->R7C2->R6C2->R5C2->R5C3, and R2C2->R2C1 (drawn
// tip-first R2C1->R2C2 with the bulb circle on R2C2, so listed here in
// reverse of the drawn waypoint order).
const thermometers = [
  ['R5C6', 'R4C7'],
  ['R6C9', 'R7C9'],
  ['R8C4', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R5C3'],
  ['R2C2', 'R2C1'],
].map(cells => new Thermo(...cells));

return [
  SHAPE,
  ...isofillRegions,
  ...entropicLines,
  ...thermometers,
];
