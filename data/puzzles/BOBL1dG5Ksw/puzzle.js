// Title: Under the Radar
// Author: guru
// Video: https://www.youtube.com/watch?v=BOBL1dG5Ksw
// Source: https://sudokupad.app/vr35ejkt5p

// Normal sudoku. Two givens: R8C2=5, R9C3=4.
//
// Radar cells: hidden in the grid are 9 solver-placed "radar" cells, one per
// row/column/box. A radar cell looks toward each grid edge along its own row
// and column; it may scan the cell it reaches at each edge, except an edge it
// is already sitting on (it never scans itself). Its own digit is the count
// of edge cells it scans; its "value" is the sum of the digits in the cells
// actually scanned. The rules give only the count, never which of the
// available edge cells are chosen, so a radar cell's value is modelled below
// as an existential choice: any selection of that size is legal as long as
// some selection makes the clue that reads it hold.
//
// Killer cages are stated in terms of cell "value" for their total (but
// "digit" for the no-repeats part); an ordinary (non-radar) cell's value
// defaults to its digit, since the rules never give "value" independent
// meaning outside the radar definition above. Dynamic fog is a solving aid
// (which cells are hidden until revealed) with no effect on the final grid,
// so it is not encoded.
//
// Omitted: the green German Whisper lines, the pink Renban lines, and the
// black/white Kropki dots are all stated in "value" terms too, but a
// radar's value can range up to 34 (see radarTargets below), while ISS caps
// any single cell/Var's domain at 16 -- so, unlike a cage total (a known
// constant that a radar's scanned cells can be summed into directly, with no
// intermediate cell ever needing to hold a value above 9), these clues would
// need a radar's value compared *inequationally* (difference, ratio,
// set-membership) against another cell, which has no bounded-cell
// representation here.

const graph = cellGraph('9x9');

// --- Radar placement: one flag per grid cell, true iff it is the hidden
// radar of its row/column/box. Flags use 1=not-radar, 2=radar so that
// "exactly one flag is 2 among a house's 9 flags" is just "the 9 flags sum to
// 10" (8 ones and a two) -- no separate boolean semantics needed.
const radarOverlay = graph.makeOverlay('VA');
const radarFlags = radarOverlay.at(graph.cells());
// One shifted copy of "this flag is 1 (not radar) or 2 (radar)" per cell.
const radarFlagGivens = [radarOverlay.makeReplicate(
  new Given(radarFlags[0], 1, 2))];
const oneRadarPerHouse = (cells) => new Sum(10, ...radarOverlay.at(cells));
const radarPlacement = [
  ...graph.rows().map(oneRadarPerHouse),
  ...graph.columns().map(oneRadarPerHouse),
  ...graph.boxes().map(oneRadarPerHouse),
];

// The cells a radar at `cell` could scan: the edge cell of its row/column in
// each orthogonal direction, omitting any direction whose edge cell is itself
// (a corner cell has 2 candidates, a non-corner edge cell 3, an interior
// cell 4).
function radarTargets(cell) {
  const { row, col } = parseCellId(cell);
  const targets = [];
  if (row !== 1) targets.push(makeCellId(1, col));
  if (row !== 9) targets.push(makeCellId(9, col));
  if (col !== 1) targets.push(makeCellId(row, 1));
  if (col !== 9) targets.push(makeCellId(row, 9));
  return targets;
}

function nonEmptySubsets(items) {
  const subsets = [];
  for (let mask = 1; mask < (1 << items.length); mask++) {
    subsets.push(items.filter((_, i) => mask & (1 << i)));
  }
  return subsets;
}

// For a cell no clue below reads as a "value": it still needs to be a
// *legal* radar if chosen (its digit can't exceed how many cells it could
// scan).
function radarValidity(cell) {
  const cap = radarTargets(cell).length;
  const validDigits = Array.from({ length: cap }, (_, i) => i + 1);
  return new Or([
    new Given(radarOverlay.at(cell), 1),
    new Given(cell, ...validDigits),
  ]);
}

// A killer cage's total is a known constant, so a radar member's value can
// be substituted straight into the Sum as its scanned cells -- no
// intermediate "value" cell is needed (contrast the omitted line/dot clues
// above). Exactly one member may be the radar (cage members always share a
// row, column or box here, and a house has only one radar), or none are.
function cageTotal(cells, total) {
  const noneAreRadar = new And([
    ...cells.map(c => new Given(radarOverlay.at(c), 1)),
    new Sum(total, ...cells),
  ]);
  const oneIsRadar = cells.flatMap((radarCell, i) => {
    const others = cells.filter((_, j) => j !== i);
    return nonEmptySubsets(radarTargets(radarCell)).map(subset => new And([
      new Given(radarOverlay.at(radarCell), 2),
      ...others.map(c => new Given(radarOverlay.at(c), 1)),
      new Given(radarCell, subset.length),
      new Sum(total, ...others, ...subset),
    ]));
  });
  return new Or([noneAreRadar, ...oneIsRadar]);
}

// --- Puzzle clues (drawn geometry) ---

const cages = [
  { cells: ['R8C1', 'R9C1', 'R9C2', 'R9C3'], total: 10 }, // cage #0
  { cells: ['R1C2', 'R2C1', 'R2C2'], total: 6 },          // cage #1
  { cells: ['R4C5', 'R5C5', 'R5C6'], total: 48 },         // cage #2
  { cells: ['R8C5', 'R9C5'], total: 29 },                 // cage #3
  { cells: ['R7C3', 'R7C4'], total: 16 },                 // cage #4
  { cells: ['R2C4', 'R3C4'], total: 26 },                 // cage #5
];
const decryptedWhisperLine = ['R4C4', 'R4C5', 'R4C6']; // line #5, brown

const cageConstraints = cages.flatMap(({ cells, total }) => [
  new AllDifferent(...cells),
  cageTotal(cells, total),
]);
const decryptedWhisper = new Whisper(5, ...decryptedWhisperLine);

const cageCells = new Set(cages.flatMap(({ cells }) => cells));
const otherRadarValidity = graph.cells()
  .filter(c => !cageCells.has(c))
  .map(radarValidity);

return [
  new Shape('9x9'),
  new Given('R8C2', 5),
  new Given('R9C3', 4),

  radarOverlay.toVar('radar cell flags'),
  ...radarFlagGivens,
  ...radarPlacement,
  ...otherRadarValidity,

  ...cageConstraints,
  decryptedWhisper,
];
