// Title: Grouping All but One
// Author: Sneppix
// Video: https://www.youtube.com/watch?v=ejAp2wK1B8w
// Source: https://sudokupad.app/xyib4cu1cz

// Rules encoded here, in full:
//   * Normal Sudoku.
//   * The 80 cells other than the grey R9C7 are divided into orthogonally
//     connected groups; R9C7 belongs to no group but still obeys Sudoku.
//   * Each group holds exactly one white-square cell. There are 16 squares,
//     so 16 groups.
//   * A square cell's digit N is the size of its group, N is the largest or
//     the smallest digit of the group, and a group's digits do not repeat.
//   * White dots: consecutive digits, and the two cells lie in different
//     groups. The rules state no negative dot constraint, so undotted edges
//     are unconstrained.
// Nothing is omitted.

// The groups are unknown, so each cell carries a label naming the square cell
// whose group it joins. Squares only ever appear in row 1 and row 9, so two
// label layers suffice, each naming a column: VT for the row-1 squares, VU for
// the row-9 squares. NONE means "this layer's groups do not contain me", which
// needs a 10th value, hence the widened alphabet.
const NONE = 10;
const shape = new Shape('9x9', NONE);
const graph = cellGraph(shape);
const geom = graph.gridGeometry();
const gridCells = graph.cells();
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Drawn clues.
const GREY = 'R9C7';                            // grey full-cell square
const topCols = [1, 2, 3, 4, 5, 6, 7, 8, 9];    // white squares in row 1
const botCols = [1, 2, 3, 5, 6, 8, 9];          // white squares in row 9
const givens = [new Given('R3C7', 9), new Given('R9C3', 1)];
const dots = [['R4C1', 'R5C1'], ['R1C9', 'R2C9'], ['R5C5', 'R5C6']];

const top = graph.makeOverlay('VT');
const bot = graph.makeOverlay('VU');

// The widened alphabet exists only for the labels; grid digits stay 1-9.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const anchors = [
  ...topCols.map(
    c => ({ layer: top, group: 'VT', label: c, cell: makeCellId(1, c) })),
  ...botCols.map(
    c => ({ layer: bot, group: 'VU', label: c, cell: makeCellId(9, c) })),
];
const tagOf = (a) => `${a.group}${a.label}`;

// Each square cell is pinned to its own label, which is what makes every group
// hold exactly one square: no two squares can share a label.
const anchorGivens = anchors.map(a => new Given(a.layer.at(a.cell), a.label));

// Every other cell joins exactly one group -- exactly one of its two labels is
// a real label -- while the grey cell joins none.
const exclusiveKey = Pair.fnToKey((t, u) => (t === NONE) !== (u === NONE), geom);
const exclusive = gridCells.filter(c => c !== GREY).map(
  c => new Pair(exclusiveKey, 'one-group', top.at(c), bot.at(c)));
const greyOut = [new Given(top.at(GREY), NONE), new Given(bot.at(GREY), NONE)];

// A group is one orthogonally connected region, so the cells carrying a given
// label are one region.
const connectivity = anchors.map(a => new ConnectedValues(a.group, a.label));

const dist = (a, b) => {
  const p = parseCellId(a), q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};

// A group has at most 9 cells and is connected, so a member is at most 8 steps
// from its square -- and at most N-1 steps when the square holds N. The first
// is a static domain cut, the second relates the label to the square's digit.
const reach = (a) => gridCells.filter(
  c => c !== GREY && dist(c, a.cell) <= 8);
const labelDomains = gridCells.filter(c => c !== GREY).flatMap(c => [
  new Given(top.at(c),
    ...anchors.filter(a => a.layer === top && dist(c, a.cell) <= 8)
      .map(a => a.label), NONE),
  new Given(bot.at(c),
    ...anchors.filter(a => a.layer === bot && dist(c, a.cell) <= 8)
      .map(a => a.label), NONE),
]);
const nearKey = (label, d) => Pair.fnToKey(
  (l, n) => l !== label || n > d, geom);
const nearRules = anchors.flatMap(a => reach(a)
  .filter(c => c !== a.cell)
  .map(c => new Pair(nearKey(a.label, dist(c, a.cell)), 'reach',
    a.layer.at(c), a.cell)));

// Dotted cells are in different groups: on each layer they must not share a
// real label (sharing NONE is no constraint, the other layer covers that case).
const differentGroupKey = Pair.fnToKey((a, b) => a === NONE || a !== b, geom);
const dotRules = dots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new Pair(differentGroupKey, 'split', top.at(a), top.at(b)),
  new Pair(differentGroupKey, 'split', bot.at(a), bot.at(b)),
]);

// The 16 group sizes cover the 80 non-grey cells. Row 1's nine squares are a
// whole row and so always total 45, leaving 35 for row 9's seven squares --
// that is, 10 for the two row-9 cells that are not squares.
const sizeTotal = [new Sum(10, 'R9C4', GREY)];

// Each group NFA reads the square's digit, then alternates label and digit over
// every cell the group could reach.
const scan = (a) => [a.cell, ...reach(a).flatMap(c => [a.layer.at(c), c])];

// Group size and "N is the largest or the smallest digit". State: n is the
// square's digit, c counts labelled cells, a/b record having seen a digit above
// / below n (both is a reject, which is exactly "n is an extreme"), and act
// alternates between reading a label (-1) and reading the digit of a cell that
// is in the group (1) or not (0).
const sizeSpec = (label) => NFA.encodeSpec({
  startState: { n: null },
  transition: (s, v) => {
    if (s.n === null) return { n: v, c: 0, a: 0, b: 0, act: -1 };
    if (s.act === -1) {
      return { n: s.n, c: s.c, a: s.a, b: s.b, act: (v === label ? 1 : 0) };
    }
    if (s.act === 0) return { n: s.n, c: s.c, a: s.a, b: s.b, act: -1 };
    const c = s.c + 1;
    if (c > s.n) return undefined;
    const a = s.a || (v > s.n ? 1 : 0);
    const b = s.b || (v < s.n ? 1 : 0);
    if (a && b) return undefined;
    return { n: s.n, c, a, b, act: -1 };
  },
  accept: (s) => s.n !== null && s.c === s.n,
}, geom);
const sizeRules = anchors.map(
  a => new NFA(sizeSpec(a.label), `size${tagOf(a)}`, ...scan(a)));

// No repeated digit inside a group: one machine per (group, digit) rejects a
// second labelled cell holding that digit. Same label/digit alternation, so it
// reuses the group's scan minus the leading square-digit cell.
const distinctSpec = (label, digit) => NFA.encodeSpec({
  startState: { seen: 0, act: -1 },
  transition: (s, v) => {
    if (s.act === -1) return { seen: s.seen, act: (v === label ? 1 : 0) };
    if (s.act === 0 || v !== digit) return { seen: s.seen, act: -1 };
    if (s.seen) return undefined;
    return { seen: 1, act: -1 };
  },
  accept: () => true,
}, geom);
const distinctRules = anchors.flatMap(a => DIGITS.map(
  d => new NFA(distinctSpec(a.label, d), `uniq${tagOf(a)}_${d}`,
    ...scan(a).slice(1))));

return [
  shape,
  top.toVar('top'),
  bot.toVar('bottom'),
  digitDomain,
  ...givens,
  ...anchorGivens,
  ...labelDomains,
  ...exclusive,
  ...greyOut,
  ...nearRules,
  ...connectivity,
  ...dotRules,
  ...sizeTotal,
  ...sizeRules,
  ...distinctRules,
];
