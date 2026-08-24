// Title: Zeroth Law Of Chromodynamics
// Author: twototenth
// Video: https://www.youtube.com/watch?v=LWP7LQ_5x3U
// Source: https://app.crackingthecryptic.com/sudoku/QQ4QgHBJBd

// Rules: "Each row, column, and 9-cell region must contain the digits 1 to 9
// once each. Each main diagonal (marked in blue) cannot contain a repeated
// digit. Along thermometers, digits must increase from the bulb end."
// Rows/columns stay standard Sudoku all-different (default). The nine drawn
// irregular regions replace the 3x3 boxes (NoBoxes + one Jigsaw group per
// region). No givens.

// Region membership is transcribed from the payload's `regions` array
// (entries 0-7). The 9th entry carries no cell list (an empty stub); its 9
// cells are derived below as the complement of the other 8 -- the unique way
// to complete a partition into nine disjoint 9-cell regions covering the
// grid -- and form a plus/cross shape centred on R5C5.
const explicitRegions = [
  ['R1C1', 'R1C2', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R1C9', 'R2C9', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R8C8', 'R9C8', 'R9C9', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R8C2'],
  ['R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C3'],
  ['R2C3', 'R3C3', 'R3C4', 'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R4C7'],
  ['R2C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R6C7', 'R6C6', 'R7C8'],
  ['R7C7', 'R8C7', 'R8C6', 'R7C6', 'R8C5', 'R8C4', 'R7C4', 'R6C4', 'R6C3'],
];
const allCells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) allCells.push(makeCellId(r, c));
}
const explicitCells = new Set(explicitRegions.flat());
const complementRegion = allCells.filter(cell => !explicitCells.has(cell));
const regions = [...explicitRegions, complementRegion];

// Diagonals, drawn deepskyblue, matching the rules' "main diagonal (marked
// in blue)" -- direction 1 is the R9C1-R1C9 diagonal, -1 is R1C1-R9C9.
const diagonals = [
  new Diagonal(1),
  new Diagonal(-1),
];

// Thermometers, drawn lightgray with a filled bulb circle at the first
// listed cell; digits increase from the bulb. Cell order transcribed from
// the payload's `lines` waypoints (bulb end first).
const thermos = [
  ['R3C5', 'R3C6', 'R2C7'],
  ['R5C2', 'R4C2', 'R3C3'],
  ['R5C8', 'R6C8', 'R7C7'],
  ['R7C4', 'R8C3'],
  ['R9C6', 'R8C6', 'R8C7', 'R9C8', 'R8C9'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...diagonals,
  ...thermos.map(cells => new Thermo(...cells)),
];
