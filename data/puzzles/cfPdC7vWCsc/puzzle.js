// Title: Killer Heyawake
// Author: Kit
// Video: https://www.youtube.com/watch?v=cfPdC7vWCsc
// Source: https://app.crackingthecryptic.com/sudoku/jQQf2DBMLT

// Rules encoded: normal sudoku (default rows/columns/boxes); digits cannot
// repeat within a cage, or along either main diagonal; every cell is shaded
// dark or light; a cage's dark cells sum to its printed total, where one is
// printed; no two dark cells are orthogonally adjacent; every light cell is
// orthogonally connected to every other light cell; a straight (orthogonal)
// run of light cells never touches three or more distinct cages; and the two
// diagonals' dark-cell totals are equal to each other.

const DARK = 1;
const LIGHT = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Cage cell membership and totals, transcribed from the drawn cage outlines
// and corner labels. A blank total (null) is still a real cage: it forbids
// repeats within it but has no dark-sum target.
const cages = [
  { cells: ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R5C5', 'R5C4', 'R6C4', 'R6C5', 'R6C6'], total: 35 },
  { cells: ['R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C1', 'R8C2'], total: 4 },
  { cells: ['R9C1', 'R9C2', 'R9C3'], total: 10 },
  { cells: ['R8C3'], total: null },
  { cells: ['R4C1', 'R4C2', 'R4C3', 'R5C3', 'R5C2', 'R5C1'], total: 10 },
  { cells: ['R6C3', 'R7C3'], total: 7 },
  { cells: ['R7C4', 'R7C5', 'R9C4', 'R9C5', 'R8C4', 'R8C5'], total: 3 },
  { cells: ['R8C6', 'R8C7', 'R8C8', 'R9C8', 'R9C7', 'R9C6'], total: 3 },
  { cells: ['R7C6', 'R7C7'], total: 9 },
  { cells: ['R7C8'], total: null },
  { cells: ['R9C9', 'R8C9', 'R7C9'], total: 7 },
  { cells: ['R5C7', 'R5C8', 'R5C9', 'R6C9', 'R6C8', 'R6C7'], total: null },
  { cells: ['R4C7', 'R3C7'], total: 6 },
  { cells: ['R4C8', 'R3C8', 'R2C8', 'R2C9', 'R3C9', 'R4C9'], total: 8 },
  { cells: ['R1C7', 'R1C8', 'R1C9'], total: 8 },
  { cells: ['R2C7'], total: null },
  { cells: ['R3C5', 'R2C5', 'R1C5', 'R1C6', 'R2C6', 'R3C6'], total: null },
  { cells: ['R1C4', 'R2C4', 'R2C3', 'R1C3', 'R1C2', 'R2C2'], total: 10 },
  { cells: ['R1C1', 'R2C1', 'R3C1'], total: null },
  { cells: ['R3C2'], total: null },
  { cells: ['R3C3', 'R3C4'], total: 8 },
];

const cageIdByCell = new Map();
cages.forEach((cage, i) => cage.cells.forEach(cell => cageIdByCell.set(cell, i)));

// "Digits cannot repeat in cages": every cage, whether or not it has a
// total, including a real single-cell cage (a no-op all-different, but it
// still marks the cell as belonging to a named cage). Cage 0 (R4C4..R6C6)
// happens to be exactly the centre box, so its all-different is already the
// engine's default box constraint -- skip restating it.
const cageAllDifferent = cages
  .filter((cage, i) => i !== 0)
  .map(cage => new AllDifferent(...cage.cells));

// "Digits cannot repeat ... along the main (marked) diagonals": the two
// diagonals drawn corner-to-corner across the whole grid.
const diagonalsAllDifferent = [new Diagonal(-1), new Diagonal(1)];
const mainDiagonalCells = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const antiDiagonalCells = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];

// Every shade cell is DARK or LIGHT.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(firstShade, DARK, LIGHT));

// Rule 2: no two orthogonally-adjacent cells are both dark. One template
// edge per direction (horizontal, vertical), replicated to every grid
// position that has such a neighbour.
const notBothDarkKey = Pair.fnToKey(
  (a, b) => !(a === DARK && b === DARK), geometry.numValues);
const origin = graph.cells()[0]; // R1C1, matching shade.cells()[0] as Replicate's origin.
const rightNeighbourCells = graph.cells().filter(cell => graph.step(cell, 0, 1) !== null);
const downNeighbourCells = graph.cells().filter(cell => graph.step(cell, 1, 0) !== null);
const noAdjacentDark = [
  shade.makeReplicate(
    new Pair(notBothDarkKey, 'no-adjacent-dark-horizontal',
      shade.at(origin), shade.at(graph.step(origin, 0, 1))),
    shade.at(rightNeighbourCells)),
  shade.makeReplicate(
    new Pair(notBothDarkKey, 'no-adjacent-dark-vertical',
      shade.at(origin), shade.at(graph.step(origin, 1, 0))),
    shade.at(downNeighbourCells)),
];

// Rule 3: the light cells form exactly one orthogonally-connected region.
const lightConnected = new ConnectedValues('VS', LIGHT);

const interleave = cells => cells.flatMap(cell => [cell, shade.at(cell)]);

// Rule 1: within a totalled cage, the dark cells' digits sum to the printed
// total. Scans each cage's cells interleaved with their shade flag and adds
// a cell's digit into the running total only when its flag is DARK; the
// running total is clamped one above target so an overshoot cannot recover.
function darkSumMachine(target) {
  return NFA.encodeSpec({
    startState: { sum: 0, awaitingFlag: false, digit: null },
    transition: (state, value) => {
      if (!state.awaitingFlag) {
        return { sum: state.sum, awaitingFlag: true, digit: value };
      }
      const add = value === DARK ? state.digit : 0;
      return {
        sum: Math.min(state.sum + add, target + 1),
        awaitingFlag: false,
        digit: null,
      };
    },
    accept: (state) => !state.awaitingFlag && state.sum === target,
  }, geometry.numValues);
}
const cageDarkSums = cages
  .filter(cage => cage.total !== null)
  .map(cage => new NFA(
    darkSumMachine(cage.total), `cage-dark-sum-${cage.total}`,
    ...interleave(cage.cells)));

// Rule 5: the two diagonals' dark-cell totals are equal. One NFA scans both
// diagonals as two segments (SEGMENT_BREAK between them), adding a dark
// cell's digit on the first diagonal and subtracting it on the second;
// accepting requires the running difference to be back at zero. Both
// diagonals are also each all-different (Diagonal above), so a real dark sum
// never exceeds 45 (the full 1-9 total); the state machine cannot know that,
// so it explores hypothetical sequences with repeats too. Once the running
// difference passes what any real diagonal could produce it is clamped into
// a permanent non-accepting sink -- safe, since no accepted solution ever
// reaches it -- which keeps the compiled state count bounded regardless of
// how many times SEGMENT_BREAK is (hypothetically) revisited.
function diagonalEqualMachine() {
  const BOUND = 45;
  return NFA.encodeSpec({
    startState: { sign: 1, diff: 0, awaitingFlag: false, digit: null, dead: false },
    transition: (state, value) => {
      if (state.dead) return { dead: true };
      if (value === SEGMENT_BREAK) {
        return { sign: -1, diff: state.diff, awaitingFlag: false, digit: null, dead: false };
      }
      if (!state.awaitingFlag) {
        return { ...state, awaitingFlag: true, digit: value };
      }
      const add = value === DARK ? state.digit : 0;
      const diff = state.diff + state.sign * add;
      if (Math.abs(diff) > BOUND) return { dead: true };
      return { sign: state.sign, diff, awaitingFlag: false, digit: null, dead: false };
    },
    accept: (state) => !state.dead && !state.awaitingFlag && state.diff === 0,
  }, geometry.numValues, { multiSegment: true });
}
const diagonalDarkSumsEqual = new NFA(
  diagonalEqualMachine(), 'diagonal-dark-sums-equal',
  interleave(mainDiagonalCells), interleave(antiDiagonalCells));

// Rule 4: a straight (orthogonal) run of consecutive light cells may not
// touch three or more distinct cages. Scans one row/column of shade cells,
// tracking the set of distinct cage ids seen since the run's last dark cell
// (cage ids come from the drawn cage membership above, closed over per
// line); a light cell whose cage would be the run's third distinct cage
// rejects, and a dark cell resets the run.
function lineSpanMachine(cageIds) {
  return NFA.encodeSpec({
    startState: { pos: 0, seen: [] },
    transition: ({ pos, seen }, value) => {
      const cageId = cageIds[pos];
      let nextSeen = seen;
      if (value === LIGHT) {
        nextSeen = seen.includes(cageId) ? seen : [...seen, cageId];
        if (nextSeen.length > 2) return undefined;
      } else {
        nextSeen = [];
      }
      return { pos: pos + 1, seen: nextSeen };
    },
    accept: () => true,
    maxDepth: cageIds.length,
  }, geometry.numValues);
}
const lineSpanRules = [
  ...graph.rows().map(row => new NFA(
    lineSpanMachine(row.map(cell => cageIdByCell.get(cell))),
    'row-light-cage-span', ...shade.at(row))),
  ...graph.columns().map(col => new NFA(
    lineSpanMachine(col.map(cell => cageIdByCell.get(cell))),
    'col-light-cage-span', ...shade.at(col))),
];

return [
  new Shape('9x9'),
  ...diagonalsAllDifferent,
  ...cageAllDifferent,
  shade.toVar('shading (1=dark, 2=light)'),
  shadeDomain,
  ...noAdjacentDark,
  lightConnected,
  ...cageDarkSums,
  diagonalDarkSumsEqual,
  ...lineSpanRules,
];
