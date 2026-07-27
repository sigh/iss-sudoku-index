// Title: Anti-Sums
// Author: Sayori
// Video: https://www.youtube.com/watch?v=r4rHEPUhCTs
// Source: https://sudokupad.app/dfjxdryzuo

// Normal sudoku, plus:
// - Anti-cage: a cage's digit sum must NOT satisfy the inequality printed in
//   its top-left corner (">N" forbids sum>N, so the allowed sums are <=N;
//   "<N" forbids sum<N, so the allowed sums are >=N). Cages do not impose
//   their own all-different requirement (digits may repeat, per the rules
//   text), so each is a plain `Sum`, not a `Cage`.
// - Anti-arrow: the digits on an arrow's arm must NOT sum to the digit in
//   its attached (bulb) cell.

function* range(lo, hi) {
  for (let v = lo; v <= hi; v++) yield v;
}

// Cage cells and printed inequality (cell set = the outlined region, value =
// the printed "<N"/">N" label in its top-left corner).
const cages = [
  ['<23', 'R6C7', 'R7C6', 'R7C7'],
  ['>9', 'R8C3', 'R8C4', 'R9C3', 'R9C4'],
  ['>7', 'R3C3', 'R3C4', 'R4C3'],
  ['<14', 'R4C7', 'R4C8'],
  ['>6', 'R6C2', 'R6C3'],
  ['<14', 'R4C4', 'R5C4'],
  ['>6', 'R5C6', 'R6C6'],
  ['>9', 'R6C1', 'R7C1'],
  ['<11', 'R3C9', 'R4C9'],
  ['>7', 'R8C6', 'R9C6'],
  ['>7', 'R1C1', 'R1C2'],
  ['<10', 'R7C9', 'R8C9'],
  ['<31', 'R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['<13', 'R1C4', 'R2C4'],
];

// A cage's forbidden sums are one open-ended side of its printed inequality;
// the allowed sums are the other side, clipped to the cage's naive
// [cellCount, 9*cellCount] range. Enumerating the allowed totals as an
// `Or` of `Sum`s is direct: no built-in class expresses an inequality bound
// on a cage total, and the term count here stays small (<=9 per cage).
function antiCage(label, ...cells) {
  const m = /^([<>])(\d+)$/.exec(label);
  if (!m) throw new Error(`Unrecognised cage label: ${label}`);
  const [, op, nStr] = m;
  const n = +nStr;
  const lo = cells.length * 1;
  const hi = cells.length * 9;
  const [rangeLo, rangeHi] = op === '>' ? [lo, n] : [n, hi];
  return new Or([...range(rangeLo, rangeHi)].map(s => new Sum(s, ...cells)));
}

// Arrow bulb + arm cells (bulb = the line-path cell carrying a circle
// overlay; arm = the rest of that drawn path). R7C7 carries two separate
// drawn paths (one 3-cell arm, one 1-cell arm) rather than one path with a
// bend, so each is kept as its own clue against the shared bulb rather than
// merged into a single arm.
const arrows = [
  { bulb: 'R7C3', arm: ['R8C3', 'R9C4', 'R9C3'] },
  { bulb: 'R7C7', arm: ['R8C7', 'R7C8', 'R7C9'] },
  { bulb: 'R7C7', arm: ['R6C8'] },
  { bulb: 'R4C8', arm: ['R3C7'] },
  { bulb: 'R3C8', arm: ['R3C7', 'R3C6'] },
  { bulb: 'R2C2', arm: ['R1C1', 'R1C2'] },
  { bulb: 'R7C5', arm: ['R6C6', 'R5C7'] },
];
// One Var prefix per arrow, used only when its arm has >1 cell (see below).
const arrowVarPrefixes = ['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'];
// A value grid cells never take, standing in for "the arm sum is >= 10 (so
// it cannot equal any bulb digit)" once clamped -- see antiArrow.
const CLAMP_SENTINEL = 10;

// "Arm sum != bulb digit" compares a derived total against a single cell,
// which isn't a fixed target so antiCage's Or-of-Sum doesn't apply, and a
// raw total Var would need a range up to 9*armLength -- above the solver's
// per-puzzle value-count ceiling for a 2+ cell arm. Since the only fact that
// matters is whether the arm sum lands in 1-9 (and if so, which digit), tie
// a small clamp Var to it: equal to the arm sum when that is a single digit,
// or CLAMP_SENTINEL when the arm sum is 10 or more. Then the arm sum can
// equal the bulb only when the clamp does, so `AllDifferent` on the clamp
// and bulb is exactly the rule. A single-cell arm needs none of this: its
// "sum" is just its own value, so the rule is `AllDifferent(bulb, cell)`.
function antiArrow(bulb, arm, prefix) {
  if (arm.length === 1) {
    return [new AllDifferent(bulb, arm[0])];
  }

  const lo = arm.length * 1;
  const hi = arm.length * 9;
  const clamp = new Var(prefix, `${bulb} clamped arm sum`, 1);
  const clampCell = clamp.cell(1);

  const branches = [...range(lo, Math.min(hi, 9))].map(
    s => new And([new Sum(s, ...arm), new Given(clampCell, s)]));
  if (hi >= 10) {
    branches.push(new And([
      new Or([...range(Math.max(lo, 10), hi)].map(s => new Sum(s, ...arm))),
      new Given(clampCell, CLAMP_SENTINEL),
    ]));
  }

  return [
    clamp,
    new Or(branches),
    new AllDifferent(bulb, clampCell),
  ];
}

const grid = cellGraph('9x9');
// Every grid cell gets the same "real digit" restriction, so replicate one
// template Given across the whole grid instead of repeating it per cell.
const gridDigits = grid.makeReplicate(
  new Given(grid.cells()[0], ...range(1, 9)));

return [
  // Widened only enough for the clamp Vars' sentinel value (see antiArrow);
  // grid cells are restricted back to real digits immediately below.
  new Shape('9x9', CLAMP_SENTINEL),
  gridDigits,

  ...cages.map(([label, ...cells]) => antiCage(label, ...cells)),

  ...arrows.flatMap(
    ({ bulb, arm }, i) => antiArrow(bulb, arm, arrowVarPrefixes[i])),
];
