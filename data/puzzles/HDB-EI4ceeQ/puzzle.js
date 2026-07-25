// Title: Three in the Spotlight
// Author: sshrpe
// Video: https://www.youtube.com/watch?v=HDB-EI4ceeQ
// Source: https://sudokupad.app/ocw0x2hxdd

// Normal sudoku rules apply (standard box regions). Rules encoded below:
// - Three in the Spotlight: every box's 3 is in the box's centre or one of
//   its four corners -- i.e. never on one of the four edge-midpoint cells.
// - Every Whisper: every single line, single dot, or single cage must
//   contain at least one 3 among its own cells.
// - Three's Company: every 3 is horizontally adjacent (left or right) to a
//   multiple of 3 (3, 6 or 9).
// - Pink lines are Renban (distinct, consecutive set); green lines are
//   German-whisper (adjacent difference >= 5); the striped teal line needs
//   every 3 sequential cells to hold one digit each from {1,4,7}, {2,5,8},
//   {3,6,9} -- exactly Modular(3)'s definition (a complete residue system
//   mod 3 in every window of 3).
// - Cages are killer cages (distinct, sum to the corner total). Dot pairs
//   are Kropki: white = consecutive, black = one double the other.
// The fog/reveal mechanic ("I Can Three Clearly Now the Fog Has Gone") is
// solving UI, not a rule on the finished grid, and is not encoded.

const graph = cellGraph('9x9');

// --- Three in the Spotlight ---
// Each box's cell list here is row-major, so indices 1,3,5,7 are the four
// edge-midpoints (0,2,6,8 are corners; 4 is the centre). Restrict 3 out of
// those cells' candidates.
const spotlightGivens = graph.boxes()
  .flatMap(box => [box[1], box[3], box[5], box[7]])
  .map(cell => new Given(cell, 1, 2, 4, 5, 6, 7, 8, 9));

// --- Three's Company: every 3 has a horizontal multiple-of-3 neighbour ---
// mult3Implies(a, b) holds whenever a isn't 3, or b is a multiple of 3 -- so
// Or(...) over a cell's horizontal neighbours is true unless the cell is 3
// and neither horizontal neighbour is a multiple of 3.
const mult3Implies = Pair.fnToKey((a, b) => a !== 3 || b % 3 === 0, 9);
const threesCompany = graph.cells().map(cell => {
  const neighbours = [graph.step(cell, 0, -1), graph.step(cell, 0, 1)]
    .filter(n => n !== null);
  const options = neighbours.map(n => new Pair(mult3Implies, '', cell, n));
  return options.length === 1 ? options[0] : new Or(options);
});

// --- Cages ---
const CAGES = [
  { total: 10, cells: ['R1C1', 'R1C2', 'R1C3', 'R2C2'] },
  { total: 10, cells: ['R7C7', 'R7C8', 'R7C9'] },
];
const cages = CAGES.map(({ total, cells }) => new Cage(total, ...cells));

// --- Dots ---
const blackDots = [['R4C4', 'R4C5']].map(([a, b]) => new BlackDot(a, b));
const whiteDots = [
  ['R5C8', 'R5C9'],
  ['R8C5', 'R8C6'],
  ['R8C1', 'R9C1'],
].map(([a, b]) => new WhiteDot(a, b));

// --- Lines ---
const RENBAN_LINES = [
  ['R3C7', 'R4C7', 'R5C7', 'R5C6', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
  ['R5C2', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C4', 'R6C5'],
  // Closed loop; Renban is set-based so the closing repeat is omitted.
  ['R3C5', 'R3C6', 'R2C6', 'R1C5', 'R2C4'],
];
const renbanLines = RENBAN_LINES.map(cells => new Renban(...cells));

const WHISPER_LINES = [
  ['R3C8', 'R4C8', 'R5C8', 'R4C9', 'R3C9', 'R2C9'],
  ['R4C4', 'R5C3', 'R4C3', 'R4C2', 'R4C1'],
];
const whisperLines = WHISPER_LINES.map(cells => new Whisper(5, ...cells));

const MODULAR_LINE = ['R1C9', 'R1C8', 'R1C7', 'R2C7', 'R2C8'];
const modularLine = new Modular(3, ...MODULAR_LINE);

// --- Every Whisper: every single line/dot/cage instance contains a 3 ---
// One cell-list per clue instance (not flattened together), so each clue's
// own cells get their own "contains a 3" check.
const everyWhisperCellGroups = [
  ...RENBAN_LINES, ...WHISPER_LINES, MODULAR_LINE,
  ...blackDots.map(d => d.cells), ...whiteDots.map(d => d.cells),
  ...CAGES.map(c => c.cells),
];
const everyWhisper = everyWhisperCellGroups
  .map(cells => new ContainAtLeast('3', ...cells));

return [
  new Shape('9x9'),
  ...spotlightGivens,
  ...threesCompany,
  ...cages,
  ...blackDots,
  ...whiteDots,
  ...renbanLines,
  ...whisperLines,
  modularLine,
  ...everyWhisper,
];
