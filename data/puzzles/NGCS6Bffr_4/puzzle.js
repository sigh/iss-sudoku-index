// Title: Under The Microscope
// Author: gdc
// Video: https://www.youtube.com/watch?v=NGCS6Bffr_4
// Source: https://sudokupad.app/qqfj59akio

// Rules encoded below:
//  - Normal sudoku.
//  - INOCULATION SITES: the 3x3 boxes are numbered 1-9 in reading order; a cell
//    whose digit equals its own box number is an inoculation site.  Each row and
//    each column contains an inoculation site.  Inoculation sites are infected.
//  - INFECTIONS: an infected cell infects every orthogonally adjacent cell
//    holding a smaller digit, and spreading repeats until no infected cell has a
//    smaller uninfected orthogonal neighbour.  Every infected cell traces back to
//    an inoculation site.
//  - CAVE: all uninfected cells form one orthogonally connected area, and each
//    orthogonally connected group of infected cells touches the grid's edge.
//  - DETECTOR CELLS: a digit in a blue circle is uninfected, and counts the
//    infected cells among its 8 surrounding cells.
//  - GERMY WHISPER lines join 2 infected digits differing by 5 or more.
//  - COCCI DOTS join consecutive uninfected digits.
//
// The rules' opening line ("It just started in culture 4") is narrative framing
// for the artwork: it states no property of the finished grid, and is the only
// sentence of the rules text with no constraint below.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

const UNINF = 1;
const INF = 2;

// Infection overlay.  It is 11x11, not 9x9: its inner 9x9 shadows the grid and
// the surrounding ring is pinned INF.  With the ring infected,
// ConnectedValues(INF) says every infected group is joined to the ring, i.e.
// reaches the grid's edge, while still allowing several separate infected groups
// -- which is the CAVE rule's second sentence.  ConnectedValues(UNINF) over the
// same layer is its first sentence, unaffected by the all-INF ring.  No other
// constraint references a ring cell.
const scaffold = cellGraph(cellGeometry(11, 11));
const overlay = scaffold.makeOverlay('VI');
const infection = overlay.toVar('infected');
const infCell = (cell) => {
  const { row, col } = parseCellId(cell);
  return infection.cell(row + 1, col + 1);
};
const ringCells = [];
for (let r = 1; r <= 11; r++) {
  for (let c = 1; c <= 11; c++) {
    if (r === 1 || r === 11 || c === 1 || c === 11) ringCells.push(infection.cell(r, c));
  }
}
const infectionDomain = [
  overlay.makeReplicate(new Given(infection.cell(1, 1), UNINF, INF)),
  overlay.makeReplicate(new Given(infection.cell(1, 1), INF), ringCells),
];

// Each cell's box number, from the boxes the solver itself enforces.
const boxOf = new Map();
graph.boxes().forEach((cells, i) => cells.forEach((cell) => boxOf.set(cell, i + 1)));

// INOCULATION SITES are infected: forbid (digit == box number, uninfected).
// One key per box number, since the number a site's digit must match is the
// box's position in reading order.
const siteInfectedKeys = graph.boxes().map(
  (_, i) => Pair.fnToKey((digit, flag) => !(digit === i + 1 && flag === UNINF), shape));
const sitesAreInfected = graph.cells().map((cell) => new Pair(
  siteInfectedKeys[boxOf.get(cell) - 1], 'site-infected', cell, infCell(cell)));

// Each row and each column contains an inoculation site.
const containsSite = (cells) =>
  new Or(cells.map((cell) => new Given(cell, boxOf.get(cell))));
const rowsAndColumnsHaveSites = [
  ...graph.rows().map(containsSite),
  ...graph.columns().map(containsSite),
];

// INFECTIONS, spreading half.  Scanning a row or column as
// [digit, flag, digit, flag, ...] presents every orthogonally adjacent pair
// once.  The machine holds the previous cell's (digit, flag) and, once the
// current cell's flag arrives, rejects the pair in which the infected one of the
// two holds the larger digit while the other is still uninfected -- exactly the
// situation the rule says infection removes.  d === 0 means "a digit is due
// next"; pd === 0 means "no previous cell yet".
const spreadSpec = NFA.encodeSpec({
  startState: { pd: 0, pv: 0, d: 0 },
  transition: (s, value) => {
    if (s.d === 0) return { pd: s.pd, pv: s.pv, d: value };
    if (value > INF) return undefined;  // overlay flags are UNINF/INF only
    if (s.pd !== 0) {
      if (s.pv === INF && value === UNINF && s.d < s.pd) return undefined;
      if (value === INF && s.pv === UNINF && s.pd < s.d) return undefined;
    }
    return { pd: s.d, pv: value, d: 0 };
  },
  accept: (s) => s.d === 0 && s.pd !== 0,
}, shape);
const interleave = (cells) => cells.flatMap((cell) => [cell, infCell(cell)]);
const spreading = [...graph.rows(), ...graph.columns()].map(
  (cells) => new NFA(spreadSpec, 'spread', ...interleave(cells)));

// INFECTIONS, traceability half.  An infected cell that is not an inoculation
// site must have been infected by an orthogonal neighbour that is itself
// infected and holds a larger digit.  The infecting digit is strictly larger at
// every step, so following those neighbours cannot cycle, and this local
// requirement is what traces each infected cell back to a site.
// The scan is [digit, flag] of the cell, then [digit, flag] of each of its
// orthogonal neighbours; need === -1 before the cell's own flag has been read,
// 0 once nothing further is required, otherwise the digit an infecting
// neighbour must beat.  One spec per box number, again because a site is a digit
// matching its box.
const traceSpecs = graph.boxes().map((_, i) => NFA.encodeSpec({
  startState: { need: -1, d: 0 },
  transition: (s, value) => {
    if (s.d === 0) return { need: s.need, d: value };
    if (value > INF) return undefined;
    if (s.need === -1) {
      if (value === UNINF) return { need: 0, d: 0 };
      if (s.d === i + 1) return { need: 0, d: 0 };  // an inoculation site
      return { need: s.d, d: 0 };
    }
    if (s.need === 0) return { need: 0, d: 0 };
    if (value === INF && s.d > s.need) return { need: 0, d: 0 };
    return { need: s.need, d: 0 };
  },
  accept: (s) => s.d === 0 && s.need === 0,
}, shape));
const traceable = graph.cells().map((cell) => new NFA(
  traceSpecs[boxOf.get(cell) - 1], 'traceable',
  ...interleave([cell, ...graph.neighbours(cell)])));

// CAVE.
const cave = [
  new ConnectedValues('VI', UNINF),
  new ConnectedValues('VI', INF),
];

// DETECTOR CELLS: the five pale-blue circles, drawn one per cell.
const detectorCells = ['R3C5', 'R4C3', 'R5C3', 'R5C6', 'R8C8'];
// Each overlay flag is UNINF=1 or INF=2, so the eight surrounding flags sum to
// 8 plus the number of infected neighbours, and that count is the circled digit.
const detectors = detectorCells.flatMap((cell) => [
  new Given(infCell(cell), UNINF),
  new Sum(8, ...graph.kingNeighbours(cell).map(infCell), [cell, -1]),
]);

// GERMY WHISPER lines: the four green two-cell strokes, each running
// diagonally.  The wider white stroke drawn under each is the same line, not a
// second clue.
const whisperPairs = [['R8C1', 'R7C2'], ['R5C4', 'R4C5'], ['R4C8', 'R5C9'], ['R8C6', 'R7C5']];
const whispers = whisperPairs.flatMap(([a, b]) => [
  new Whisper(5, a, b),
  new Given(infCell(a), INF),
  new Given(infCell(b), INF),
]);

// COCCI DOTS: the three large plum discs centred on a cell edge, each between
// two horizontally adjacent cells.  The nine small plum specks ringing each disc
// are drawn micro-organisms, not further dots.
const dotPairs = [['R2C2', 'R2C3'], ['R4C6', 'R4C7'], ['R8C7', 'R8C8']];
const dots = dotPairs.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new Given(infCell(a), UNINF),
  new Given(infCell(b), UNINF),
]);

return [
  shape,
  infection,
  ...infectionDomain,
  ...sitesAreInfected,
  ...rowsAndColumnsHaveSites,
  ...spreading,
  ...traceable,
  ...cave,
  ...detectors,
  ...whispers,
  ...dots,
];
