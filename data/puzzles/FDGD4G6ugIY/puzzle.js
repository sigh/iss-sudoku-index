// Title: Clone Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FDGD4G6ugIY
// Source: https://app.crackingthecryptic.com/d3qQfTPnnr

// Normal sudoku rules apply. Two grey 18-cell regions are clones of one
// another: region B is region A translated by +5 rows / -2 columns (no
// rotation or reflection), derived by overlaying the payload's two 18-cell
// underlay sets and finding the single offset under which one maps onto the
// other. Region A and region B must hold identical digits in identical
// relative positions.

const givens = [
  new Given('R1C2', 1), new Given('R1C3', 2), new Given('R2C3', 3),
  new Given('R2C4', 4), new Given('R2C5', 5), new Given('R3C5', 6),
  new Given('R3C6', 7), new Given('R3C7', 8), new Given('R4C7', 9),
];

// Region A cells, transcribed from the payload's underlay fills.
const regionA = [
  'R3C3', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R3C8', 'R3C7',
  'R2C8', 'R1C7', 'R1C6', 'R2C6', 'R3C6', 'R2C5', 'R2C4', 'R1C4', 'R3C4',
];
// Region B cells, each listed at the index of its region-A pair (row+5,
// col-2), so zipping the two arrays pairs each cell with its clone.
const regionB = [
  'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R8C5',
  'R7C6', 'R6C5', 'R6C4', 'R7C4', 'R8C4', 'R7C3', 'R7C2', 'R6C2', 'R8C2',
];

// One SameValues(2, a, b) per corresponding cell pair: two size-1 sets forces
// that single cell's value to match, i.e. positional equality at that
// position. (A single SameValues over the whole 18-cell regions would only
// require the two regions' value multisets to match, not that each position
// agrees, so the regions must be paired one cell at a time.)
const clones = regionA.map((a, i) => new SameValues(2, a, regionB[i]));

return [
  new Shape('9x9'),
  ...givens,
  ...clones,
];
