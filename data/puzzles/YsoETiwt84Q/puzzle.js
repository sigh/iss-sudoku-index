// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YsoETiwt84Q
// Source: https://cracking-the-cryptic.web.app/sudoku/BHpRDFD2jJ

// Odd Even Sudoku. Rules encoded:
//   1. Normal sudoku rules apply.
//   2. Cages contain different numbers adding to sums which, if given, have
//      their digits shown as Even, Odd or Unknown.
//   3. All coloured cages contain consecutive runs of numbers in some order;
//      white cages don't (but could be e.g. 1278).
//   4. The blue cell is even.
// Nothing is omitted.

// Drawn data, transcribed cage by cage: the cells, the sum label printed in the
// cage's corner, and the cage's fill. Three fills are used (gray, gold, green)
// and no two orthogonally touching filled cages share one, so the three are a
// map-colouring of the filled cages; `white` is the 9 cages left unfilled, and
// those do touch each other. So rule 3's "coloured" is gray/gold/green and its
// "white" is `white`.
const cages = [
  { fill: 'gray',  label: '',   cells: ['R1C4', 'R1C3', 'R1C2', 'R1C1'] },
  { fill: 'gold',  label: 'O?', cells: ['R2C1', 'R3C1'] },
  { fill: 'green', label: '?',  cells: ['R2C2', 'R2C3'] },
  { fill: 'white', label: 'OO', cells: ['R3C2', 'R3C3'] },
  { fill: 'white', label: 'EE', cells: ['R2C4', 'R3C4', 'R4C4', 'R4C5', 'R3C5'] },
  { fill: 'gold',  label: '',   cells: ['R2C5', 'R1C5', 'R1C6', 'R1C7'] },
  { fill: 'gray',  label: '?',  cells: ['R1C8', 'R1C9'] },
  { fill: 'green', label: '',   cells: ['R3C6', 'R2C6', 'R2C7', 'R2C8'] },
  { fill: 'gold',  label: '',   cells: ['R2C9', 'R3C9', 'R3C8', 'R4C8'] },
  { fill: 'gray',  label: 'OE', cells: ['R3C7', 'R4C7', 'R4C6', 'R5C6', 'R5C5'] },
  { fill: 'gray',  label: '?',  cells: ['R4C9', 'R5C9', 'R5C8'] },
  { fill: 'white', label: 'EO', cells: ['R5C7', 'R6C7', 'R6C8', 'R6C9'] },
  { fill: 'white', label: 'O',  cells: ['R6C5', 'R6C6'] },
  { fill: 'gold',  label: '',   cells: ['R5C4', 'R6C4'] },
  { fill: 'gray',  label: '?',  cells: ['R4C3', 'R4C2', 'R4C1'] },
  { fill: 'white', label: '',   cells: ['R5C3', 'R5C2', 'R5C1'] },
  { fill: 'gold',  label: '?',  cells: ['R6C1', 'R7C1', 'R8C1'] },
  { fill: 'gray',  label: '',   cells: ['R6C2', 'R6C3'] },
  { fill: 'white', label: 'E',  cells: ['R7C2', 'R8C2'] },
  { fill: 'gray',  label: '',   cells: ['R9C2', 'R9C1'] },
  { fill: 'white', label: 'OO', cells: ['R7C3', 'R8C3'] },
  { fill: 'white', label: '',   cells: ['R9C3', 'R9C4', 'R9C5'] },
  { fill: 'gray',  label: '',   cells: ['R8C4', 'R7C4', 'R7C5'] },
  { fill: 'white', label: '?',  cells: ['R7C7', 'R7C8'] },
  { fill: 'gold',  label: '',   cells: ['R7C6', 'R8C6', 'R8C5', 'R8C7', 'R9C6'] },
  { fill: 'green', label: 'E?', cells: ['R8C8', 'R8C9', 'R7C9'] },
  { fill: 'gray',  label: 'O?', cells: ['R9C9', 'R9C8', 'R9C7'] },
];

// Rule 2, part 1: cage digits are all different, with no total attached here.
// `Cage(0, ...)` is ISS's "no total" form and emits only the AllDifferent.
const distinctCages = cages.map(cage => new Cage(0, ...cage.cells));

// Rule 2, part 2: the label spells the sum one glyph per decimal digit --
// 'O' odd, 'E' even, '?' either -- so its length fixes how many digits the sum
// has. Enumerate every total consistent with the label and with the arithmetic
// range of n different digits from 1-9, then disjoin over them. 0 counts as an
// even digit (so 'EE' admits 20). An empty label prints no sum at all.
const digitParityMatches = (glyph, digit) =>
  glyph === '?' || (glyph === 'O') === (digit % 2 === 1);
const totalsForLabel = (label, n) => {
  // n different digits from 1-9 sum to at least 1+..+n and at most 9+..+(10-n).
  const minTotal = (n * (n + 1)) / 2;
  const maxTotal = (n * (19 - n)) / 2;
  const lowestWithLabelWidth = label.length === 1 ? 1 : 10 ** (label.length - 1);
  const highestWithLabelWidth = 10 ** label.length - 1;
  const totals = [];
  for (let t = Math.max(minTotal, lowestWithLabelWidth);
       t <= Math.min(maxTotal, highestWithLabelWidth); t++) {
    const digits = String(t).split('').map(Number);
    if (digits.every((d, i) => digitParityMatches(label[i], d))) totals.push(t);
  }
  return totals;
};
const cageTotals = cages.filter(cage => cage.label !== '').map(cage =>
  new Or(totalsForLabel(cage.label, cage.cells.length).map(
    total => new Sum(total, ...cage.cells))));

// Rule 3, first half: a coloured cage's digits are a consecutive run.
const colouredRuns = cages.filter(cage => cage.fill !== 'white').map(
  cage => new Renban(...cage.cells));

// Rule 3, second half: a white cage's digits are NOT a consecutive run. The
// cage's digits are already all different, so they form a run exactly when
// max - min + 1 equals the count; the machine carries just those three numbers
// (`n === 0` marks the empty prefix) and accepts when the equality fails.
// maxDepth bounds the otherwise unbounded `n` at the longest white cage.
const whiteCages = cages.filter(cage => cage.fill === 'white');
const notARunSpec = NFA.encodeSpec({
  startState: { n: 0, min: 0, max: 0 },
  transition: ({ n, min, max }, value) => ({
    n: n + 1,
    min: n === 0 ? value : Math.min(min, value),
    max: n === 0 ? value : Math.max(max, value),
  }),
  accept: ({ n, min, max }) => max - min + 1 !== n,
  maxDepth: Math.max(...whiteCages.map(cage => cage.cells.length)),
}, 9);
const whiteNonRuns = whiteCages.map(
  cage => new NFA(notARunSpec, 'not-a-run', ...cage.cells));

return [
  new Shape('9x9'),
  ...distinctCages,
  ...cageTotals,
  ...colouredRuns,
  ...whiteNonRuns,
  // Rule 4: R9C8 is the one blue cell.
  new Given('R9C8', 2, 4, 6, 8),
];
