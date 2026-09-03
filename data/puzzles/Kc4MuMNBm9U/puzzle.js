// Title: Pseudoscience
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=Kc4MuMNBm9U
// Source: https://sudokupad.app/0ham0u0jtt

// Rules encoded below, in full:
//   Normal sudoku rules apply.
//   In each row, column and box there is exactly one 'pseudo cell'.
//   The digits 1-9 each appear once in a pseudo cell.
//   The value of a pseudo cell, for the purposes of the coloured lines, is its
//     row number multiplied by its column number, whatever digit it holds. Every
//     other cell's value is its own digit.
//   GERMAN WHISPER (green): adjacent values on the line differ by at least 5.
//   RENBAN (purple): the values on the line are a non-repeating consecutive set.
//   NABNER (yellow): no value on the line is equal or consecutive to another
//     value on that line.
//   REGION SUM (dark blue): the values on the line within each 3x3 box sum to
//     the same amount.
//   SAME DIFFERENCE (turquoise): every adjacent pair on the line has the same
//     difference.
//   DIFFERENT DIFFERENCE (peach): the adjacent-pair differences on the line are
//     all different from one another.

// Value 0 is carried by the overlays only; the grid digits are pinned to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Drawn geometry: one entry per coloured stroke, cells in drawn order.
// Two strokes are drawn as closed rings (they return to their first cell).
const REGION_SUM_LINES = [
  ['R2C7', 'R3C6', 'R3C5', 'R3C4', 'R2C3'],
  ['R4C5', 'R4C6', 'R5C6', 'R4C7', 'R5C7', 'R6C7',
    'R5C8', 'R5C9', 'R4C8', 'R3C9', 'R2C8', 'R1C9'],
];
const NABNER_LINES = [
  ['R4C1', 'R3C2', 'R2C2', 'R2C1', 'R3C1'],  // ring; a set rule, so order is moot
];
const RENBAN_LINES = [
  ['R3C7', 'R3C8', 'R2C9', 'R1C8'],
  ['R6C2', 'R5C3'],
  ['R6C4', 'R5C5'],
];
const WHISPER_LINES = [
  { cells: ['R1C4', 'R1C5', 'R1C6'], closed: false },
  {
    cells: ['R7C4', 'R7C3', 'R6C2', 'R5C2', 'R4C3',
      'R4C4', 'R4C5', 'R5C5', 'R6C5'], closed: true
  },
];
const SAME_DIFF_LINES = [
  ['R3C3', 'R4C2', 'R5C1', 'R5C2'],
];
const DIFF_DIFF_LINES = [
  ['R6C9', 'R6C8', 'R7C7', 'R8C8', 'R8C9'],
  ['R1C1', 'R1C2', 'R1C3'],
];

const ALL_LINES = [
  ...REGION_SUM_LINES, ...NABNER_LINES, ...RENBAN_LINES,
  ...WHISPER_LINES.map(l => l.cells), ...SAME_DIFF_LINES, ...DIFF_DIFF_LINES,
];
const lineCells = [...new Set(ALL_LINES.flat())];
const regionSumCells = REGION_SUM_LINES.flat();

// The value a cell takes when it is the pseudo cell.
const pseudoValue = cell => {
  const { row, col } = parseCellId(cell);
  return row * col;
};

const allPairs = items =>
  items.flatMap((a, i) => items.slice(i + 1).map(b => [a, b]));
const edgesOf = ({ cells, closed }) => {
  const edges = cells.map((c, i) => [c, cells[(i + 1) % cells.length]]);
  return closed ? edges : edges.slice(0, -1);
};

// --- Overlays -------------------------------------------------------------
// VP: the pseudo cell's own digit, and 0 on every ordinary cell. This is the
//     layer the two placement rules are counted over.
// VV: the line value in coded form -- 0 means "this cell is pseudo, so read
//     row*col", any other value is the digit itself. Only line cells need it.
// VF: the pseudo flag, 1 on a pseudo cell and 0 otherwise, so that a value can
//     enter a linear Sum as VV + row*col*VF. Only the region-sum lines need it.
const pseudoDigit = graph.makeOverlay('VP');
const value = graph.makeOverlay('VV', lineCells);
const isPseudo = graph.makeOverlay('VF', regionSumCells);

// The alphabet is widened to admit 0, so the playable digits are pinned back.
const gridDigits = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// VP is 0 or the cell's own digit; that is what makes it a *pseudo cell's digit*
// rather than a free label.
const pseudoDigitKey = Pair.fnToKey((digit, p) => p === 0 || p === digit, shape);
const pseudoDigitLinks = graph.cells().map(
  cell => new Pair(pseudoDigitKey, 'pseudo digit', cell, pseudoDigit.at(cell)));

// digit = VP + VV, with VP already 0-or-digit, so VV is 0 exactly on a pseudo
// cell and the digit everywhere else.
const valueLinks = lineCells.map(cell => new EqualSum(
  [cell], [pseudoDigit.at(cell), value.at(cell)]));

const pseudoFlagKey = Pair.fnToKey((v, f) => f === (v === 0 ? 1 : 0), shape);
const pseudoFlags = regionSumCells.flatMap(cell => [
  new Given(isPseudo.at(cell), 0, 1),
  new Pair(pseudoFlagKey, 'pseudo flag', value.at(cell), isPseudo.at(cell)),
]);

// --- Pseudo cell placement ------------------------------------------------
// Eight of a house's nine VP cells are 0, i.e. exactly one pseudo cell.
const onePerHouse = graph.rowsColumnsBoxes().map(
  house => new ContainExact('0_0_0_0_0_0_0_0', ...pseudoDigit.at(house)));

const pseudoDigitsOnce =
  new ContainExact('1_2_3_4_5_6_7_8_9', ...pseudoDigit.cells());

// --- Line rules -----------------------------------------------------------
// Each relation is on decoded values, and 0 decodes to a different number in
// every cell, so each cell pair gets its own key rather than one shared key.
const decode = cell => v => (v === 0 ? pseudoValue(cell) : v);
const valuePair = (name, rel) => ([a, b]) => new Pair(
  Pair.fnToKey((va, vb) => rel(decode(a)(va), decode(b)(vb)), shape),
  name, value.at(a), value.at(b));

const whispers = WHISPER_LINES.flatMap(
  line => edgesOf(line).map(
    valuePair('german whisper', (x, y) => Math.abs(x - y) >= 5)));

// k distinct integers spanning at most k-1 are exactly a consecutive run of k,
// so the whole-line renban set rule is this pairwise conjunction.
const renbans = RENBAN_LINES.flatMap(
  cells => allPairs(cells).map(valuePair(
    'renban', (x, y) => x !== y && Math.abs(x - y) <= cells.length - 1)));

const nabners = NABNER_LINES.flatMap(
  cells => allPairs(cells).map(
    valuePair('nabner', (x, y) => Math.abs(x - y) >= 2)));

// A difference can be as large as 80 (a pseudo cell read against a digit), so
// it will not fit in a Var and the two edges of a pair cannot be compared by a
// pairwise key. This machine reads the two, three or four cells the pair spans
// and carries only the previous value (while an edge is open) and the first
// edge's difference, which keeps it to a few hundred states.
// Edge e is the pair (cells[e], cells[e+1]); `used` is the cells the two edges
// span, so an edge closes at the position whose index follows the previous one.
const edgeDiffNfa = (cells, e1, e2, same, name) => {
  const used = [...new Set([e1, e1 + 1, e2, e2 + 1])].sort((a, b) => a - b);
  const decoders = used.map(i => decode(cells[i]));
  const spec = NFA.encodeSpec({
    startState: { step: 0, prev: null, first: null },
    transition: ({ step, prev, first }, v) => {
      if (step >= used.length) return undefined;
      const val = decoders[step](v);
      let nextFirst = first;
      if (step > 0 && used[step] === used[step - 1] + 1) {
        const d = Math.abs(prev - val);
        if (first === null) nextFirst = d;
        else if ((d === first) !== same) return undefined;
      }
      const next = step + 1;
      const openEdge = next < used.length && used[next] === used[step] + 1;
      return { step: next, prev: openEdge ? val : null, first: nextFirst };
    },
    accept: ({ step }) => step === used.length,
    maxDepth: used.length,
  }, shape);
  return new NFA(spec, name, value.at(used.map(i => cells[i])));
};

// Equality is transitive, so pinning each edge to the next one covers the line.
const sameDiffs = SAME_DIFF_LINES.flatMap(
  cells => cells.slice(2).map(
    (_, i) => edgeDiffNfa(cells, i, i + 1, true, 'same difference')));

// Difference is not transitive, so every pair of edges is checked.
const diffDiffs = DIFF_DIFF_LINES.flatMap(
  cells => allPairs(cells.slice(1).map((_, i) => i)).map(
    ([e1, e2]) => edgeDiffNfa(cells, e1, e2, false, 'different difference')));

// --- Region sum lines -----------------------------------------------------
const boxOf = new Map(
  graph.boxes().flatMap((cells, i) => cells.map(cell => [cell, i])));
const boxSegments = cells => cells.reduce((segments, cell) => {
  const last = segments.at(-1);
  if (last && boxOf.get(last[0]) === boxOf.get(cell)) last.push(cell);
  else segments.push([cell]);
  return segments;
}, []);

// A cell's value as linear terms: VV + row*col*VF.
const sumTerms = (cells, sign) => cells.flatMap(cell => [
  [value.at(cell), sign], [isPseudo.at(cell), sign * pseudoValue(cell)]]);
const regionSums = REGION_SUM_LINES.flatMap(cells => {
  const segments = boxSegments(cells);
  return segments.slice(1).map((segment, i) => new Sum(
    0, ...sumTerms(segments[i], 1), ...sumTerms(segment, -1)));
});

return [
  shape,
  pseudoDigit.toVar('pseudo cell digit'),
  value.toVar('line value'),
  isPseudo.toVar('pseudo flag'),
  gridDigits,
  ...pseudoDigitLinks,
  ...valueLinks,
  ...pseudoFlags,
  ...onePerHouse,
  pseudoDigitsOnce,
  ...whispers,
  ...renbans,
  ...nabners,
  ...sameDiffs,
  ...diffDiffs,
  ...regionSums,
];
