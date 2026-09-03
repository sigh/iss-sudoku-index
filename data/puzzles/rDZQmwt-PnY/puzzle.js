// Title: Quadswallop
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=rDZQmwt-PnY
// Source: https://sudokupad.app/da3cezx5at

// Rules encoded below, in order:
//   CHAOS CONSTRUCTION - divide the 8x8 grid into 8 orthogonally connected
//     regions of 8 cells; digits 1-8 do not repeat in a row, column or region.
//   DOUBLERS - each row, column and region contains exactly one doubler cell,
//     whose value is double its digit; each doubler holds a different digit.
//   QUADSWALLOP - each digit 1-8 is represented by a different letter of the
//     alphabet. In each grey quad circle 4 of the 5 letters correspond to the
//     digits (not values) of the 4 surrounding cells, and one lying letter
//     corresponds to none of them.
//   PURPLE X - values either side of a small purple X sum to 10, and the two
//     cells lie in the same region.
//   The two ends of a grey, red or blue line lie in different regions.
//   PARITY LINES (RED) - two adjacent cells along a red line hold one even and
//     one odd value.
//   REGION SUM LINES (BLUE) - region borders divide a blue line into segments
//     of equal total value.
// Nothing is omitted. The purple and green circles drawn in the two columns to
// the right of the grid are the letter/digit scratch pad the rules offer for
// tracking the key; they carry no rule and hold no answer, so the board here is
// the 8x8 playing grid alone.

// --- Drawn clue data -------------------------------------------------------

// Quad circles: each sits on a lattice corner, named here by the cell to its
// lower right, and prints five letters.
const QUADS = [
  ['R1C3', 'CLOSE'], ['R1C4', 'SOUND'], ['R1C6', 'OLDER'], ['R1C7', 'NURSE'],
  ['R2C6', 'CRUEL'], ['R3C2', 'BLUSH'], ['R3C3', 'BIRDS'], ['R3C5', 'SOLVE'],
  ['R3C7', 'BOUND'], ['R4C5', 'FLOUR'], ['R5C7', 'WORLD'], ['R6C1', 'CLOUD'],
  ['R6C3', 'DUELS'], ['R6C7', 'BROWS'],
];

// Purple X marks, as the two cells each cross is drawn between.
const PURPLE_X = [
  ['R1C1', 'R2C1'], ['R4C6', 'R4C7'], ['R5C5', 'R5C6'],
  ['R6C1', 'R6C2'], ['R6C2', 'R6C3'], ['R8C5', 'R8C6'],
];

// Coloured lines, in the order each stroke is drawn.
const RED_LINES = [
  ['R1C2', 'R2C3', 'R3C4'],
  ['R5C4', 'R6C4'],
];
const GREY_LINES = [
  ['R3C8', 'R4C8'],
  ['R5C3', 'R6C3'],
  ['R8C7', 'R8C8'],
];
const BLUE_LINES = [
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R3C7', 'R3C6', 'R2C6'],
  ['R7C1', 'R7C2', 'R8C3'],
];

// The letters printed on the quads, in a fixed order so each owns one Var cell
// holding the digit it stands for.
const ALPHABET = [...new Set(QUADS.flatMap(([, word]) => [...word]))].sort();

// --- Board and overlays ----------------------------------------------------

// Nine board values. 1-8 are the puzzle's digits; the extra value 0 is used
// only by the overlays below. Chaos regions still hold 8 cells, because region
// size follows the grid's dimensions rather than the value count.
const shape = new Shape('8x8', '0-8');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

const DIGITS = Array.from({ length: geometry.maxValue() }, (_, i) => i + 1);
const NUM_REGIONS = graph.cells().length / DIGITS.length;

const cc = graph.makeOverlay('CC');     // chaos region label, per cell
const extra = graph.makeOverlay('VD');  // doubler bonus: 0, or the cell's digit
const mark = graph.makeOverlay('VM');   // a doubler's region label, else NOT_DOUBLER
const letters = new Var('L', 'letter digits', ALPHABET.length);

// ChaosConstruction labels its regions with the NUM_REGIONS lowest board
// values, so the next value up is free as the "not a doubler" code on `mark`.
const REGION_LABELS = Array.from(
  { length: NUM_REGIONS }, (_, i) => geometry.minValue() + i);
const NOT_DOUBLER = geometry.minValue() + NUM_REGIONS;

// A cell's value is its digit plus its doubler bonus, so a cell enters a total
// as the pair of cells holding those two halves.
const valuesOf = cells => cells.flatMap(cell => [cell, extra.at(cell)]);
const letterCell = letter => letters.cell(ALPHABET.indexOf(letter) + 1);
const quadCells = cornerCell => graph.block(cornerCell, 2, 2);

// --- Chaos construction ----------------------------------------------------

const layout = [
  shape,
  new ChaosConstruction(),
  new NoBoxes(),
  // The board's own digits are 1-8; 0 belongs to the overlays only.
  graph.makeReplicate(new Given('R1C1', ...DIGITS)),
];

// --- Doublers --------------------------------------------------------------

// Three per-cell overlay agreements define a doubler:
//   `extra` is 0 on an ordinary cell and a second copy of the digit on a
//     doubler, so digit + extra is the cell's value;
//   `mark` is NOT_DOUBLER exactly when `extra` is 0;
//   `mark` otherwise repeats the cell's chaos region label, which turns "one
//     doubler per region" into a count over `mark` below.
const extraMatchesDigit = Pair.fnToKey(
  (digit, bonus) => bonus === 0 || bonus === digit, shape);
const markFlagsDoubler = Pair.fnToKey(
  (bonus, code) => (bonus === 0) === (code === NOT_DOUBLER), shape);
const markCopiesRegion = Pair.fnToKey(
  (label, code) => code === NOT_DOUBLER || code === label, shape);

const doublerOverlays = graph.cells().flatMap(cell => [
  new Pair(extraMatchesDigit, 'doubler bonus', cell, extra.at(cell)),
  new Pair(markFlagsDoubler, 'doubler mark', extra.at(cell), mark.at(cell)),
  new Pair(markCopiesRegion, 'doubler region', cc.at(cell), mark.at(cell)),
]);

// All but one cell of a row or column is ordinary, leaving exactly one doubler.
const doublersPerLine = [...graph.rows(), ...graph.columns()].map(
  house => new ContainExact(
    Array(house.length - 1).fill(0).join('_'), ...extra.at(house)));

// Only a doubler carries a region label on `mark`, so each label appearing
// exactly once there is exactly one doubler per region.
const doublersPerRegion = new ContainExact(
  REGION_LABELS.join('_'), ...mark.cells());

// Each digit is the bonus of exactly one cell: eight doublers, all different
// digits.
const doublerDigits = new ContainExact(DIGITS.join('_'), ...extra.cells());

// --- Quadswallop -----------------------------------------------------------

// No two letters stand for the same digit. Any number of them may stand for no
// digit at all (0): only eight of the fifteen letters printed on the quads are
// in the key, and a letter outside it can only ever be a lying letter.
const distinctLetters = new PairX(
  Pair.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape),
  'letter key',
  ...letters.cells());

// One machine per quad, reading the four cells and then the five letters.
// `seen` collects the quad's digits and `matched` the ones a letter has named.
// A repeated cell digit is rejected: the letters of a word are distinct and
// stand for distinct digits, so at most three of them could correspond to a
// three-digit quad, leaving two letters corresponding to none - one more lie
// than the rules allow. A letter naming a digit already named would likewise be
// a second letter corresponding to a surrounding digit, so it is rejected too;
// a letter naming no surrounding digit (0 included) is the lie. Accepting on
// matched === seen means all four digits were named, which over five letters
// leaves exactly one lying letter.
const quadMachine = NFA.encodeSpec({
  startState: { seen: 0, read: 0 },
  transition(state, value) {
    const bit = 1 << value;
    if (state.read !== undefined) {
      if (state.seen & bit) return undefined;
      const seen = state.seen | bit;
      const read = state.read + 1;
      return read < 4 ? { seen, read } : { seen, matched: 0 };
    }
    if (!(state.seen & bit)) return state;
    if (state.matched & bit) return undefined;
    return { seen: state.seen, matched: state.matched | bit };
  },
  accept: state => state.matched === state.seen,
}, shape);

const quadswallop = QUADS.map(([cornerCell, word]) => new NFA(
  quadMachine, `quad ${word}`,
  ...quadCells(cornerCell), ...[...word].map(letterCell)));

// --- Purple X --------------------------------------------------------------

const purpleX = PURPLE_X.flatMap(([a, b]) => [
  new Sum(10, ...valuesOf([a, b])),
  new SameValues(2, ...cc.at([a, b])),
]);

// --- Line endpoints --------------------------------------------------------

const lineEnds = [...GREY_LINES, ...RED_LINES, ...BLUE_LINES].map(
  cells => new AllDifferent(...cc.at([cells[0], cells[cells.length - 1]])));

// --- Red parity lines ------------------------------------------------------

// Scans digit, bonus, digit, bonus, ... so each pair of symbols is one cell's
// value; `prev` is the parity of the previous cell's value, which the next
// cell's value must differ from.
const alternatingParity = NFA.encodeSpec({
  startState: { prev: null, digit: null },
  transition({ prev, digit }, value) {
    if (digit === null) return { prev, digit: value };
    const parity = (digit + value) % 2;
    if (parity === prev) return undefined;
    return { prev: parity, digit: null };
  },
  accept: state => state.digit === null,
}, shape);

const parityLines = RED_LINES.map((cells, i) => new NFA(
  alternatingParity, `red line ${i + 1}`, ...valuesOf(cells)));

// --- Blue region sum lines -------------------------------------------------

// RegionSumLine is rejected alongside ChaosConstruction, so each blue line is
// written as a disjunction over the ways the regions can cut it: one branch per
// subset of its steps that is a region border, holding that branch's region
// equalities together with the equal-sum split they produce. The branches'
// region conditions are mutually exclusive, so the branch matching the solver's
// region layout is the one whose totals are enforced.
const regionSumLine = (cells) => {
  const steps = cells.length - 1;
  const branches = [];
  for (let pattern = 0; pattern < (1 << steps); pattern++) {
    const branch = [];
    const segments = [];
    let segment = [cells[0]];
    for (let i = 0; i < steps; i++) {
      const pair = [cells[i], cells[i + 1]];
      if (pattern & (1 << i)) {
        branch.push(new AllDifferent(...cc.at(pair)));
        segments.push(segment);
        segment = [pair[1]];
      } else {
        branch.push(new SameValues(2, ...cc.at(pair)));
        segment.push(pair[1]);
      }
    }
    segments.push(segment);
    // A line lying wholly inside one region has a single segment and no total
    // to match; the endpoint rule above is what excludes that branch here.
    if (segments.length > 1) branch.push(new EqualSum(...segments.map(valuesOf)));
    branches.push(new And(branch));
  }
  return new Or(branches);
};

const regionSumLines = BLUE_LINES.map(regionSumLine);

return [
  ...layout,
  extra.toVar('doubler bonus'),
  mark.toVar('doubler region mark'),
  letters,
  ...doublerOverlays,
  ...doublersPerLine,
  doublersPerRegion,
  doublerDigits,
  distinctLetters,
  ...quadswallop,
  ...purpleX,
  ...lineEnds,
  ...parityLines,
  ...regionSumLines,
];
