// Title: Grouping All but Two
// Author: Sneppix
// Video: https://www.youtube.com/watch?v=ktjNaziMZIg
// Source: https://sudokupad.app/28d8kmh1jf

// Rules encoded here, in full:
//   * Normal Sudoku.
//   * The 79 cells other than the grey R9C7 and R9C9 are divided into
//     orthogonally connected groups; the two grey cells belong to no group but
//     still obey Sudoku.
//   * Each group holds exactly one white-circle cell. There are 18 circles, so
//     18 groups.
//   * A circle cell's digit N is the size of its group, and every cell of that
//     group holds a digit of the same parity as N.
//   * White dots: consecutive digits. The rules state that not all dots are
//     given, so undotted edges are unconstrained.
// Nothing is omitted.

// The groups are unknown, so each cell carries a label naming the circle cell
// whose group it joins. There are 18 circles and only 16 values available, so
// the labels are split over two layers: VT names one of the nine row-5 circles
// by its column, VU names one of the nine remaining circles by its index in the
// list below. NONE means "this layer's groups do not contain me", which needs a
// 10th value, hence the widened alphabet.
const NONE = 10;
const shape = new Shape('9x9', NONE);
const graph = cellGraph(shape);
const geom = graph.gridGeometry();
const gridCells = graph.cells();
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Drawn clues.
const GREY = ['R9C7', 'R9C9'];                  // full-cell grey shapes
const rowFiveCols = [1, 2, 3, 4, 5, 6, 7, 8, 9];  // circles filling row 5
const lowerCircles = [                          // the nine other circles
  'R7C1', 'R7C2', 'R7C3', 'R7C4',
  'R8C6', 'R8C7', 'R8C8', 'R8C9',
  'R9C6',
];
const dots = [
  ['R1C1', 'R1C2'], ['R1C8', 'R1C9'], ['R2C2', 'R3C2'], ['R2C8', 'R3C8'],
  ['R4C4', 'R4C5'], ['R6C7', 'R7C7'], ['R8C2', 'R8C3'],
];

const top = graph.makeOverlay('VT');
const bot = graph.makeOverlay('VU');

// The widened alphabet exists only for the labels; grid digits stay 1-9.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const anchors = [
  ...rowFiveCols.map(
    c => ({ layer: top, group: 'VT', label: c, cell: makeCellId(5, c) })),
  ...lowerCircles.map(
    (cell, i) => ({ layer: bot, group: 'VU', label: i + 1, cell })),
];
const anchorCells = new Set(anchors.map(a => a.cell));
const outOfGroup = new Set([...anchorCells, ...GREY]);

// A group holds exactly one circle and no grey cell, so a member reaches its own
// circle through cells that are neither. Distances are therefore measured in the
// grid graph with the other circles and the two grey cells deleted; a group has
// at most 9 cells, so a member is at most 8 such steps away.
const reachFrom = (a) => {
  const dist = new Map([[a.cell, 0]]);
  const queue = [a.cell];
  for (const cell of queue) {
    if (dist.get(cell) === 8) continue;
    for (const next of graph.neighbours(cell)) {
      if (dist.has(next) || (next !== a.cell && outOfGroup.has(next))) continue;
      dist.set(next, dist.get(cell) + 1);
      queue.push(next);
    }
  }
  return dist;
};
const reach = new Map(anchors.map(a => [a, reachFrom(a)]));

// Each circle is pinned to its own label, which is what makes every group hold
// exactly one circle: no two circles can share a label. The other layer's label
// is NONE, since a circle is in its own group and no other.
const anchorGivens = anchors.flatMap(a => [
  new Given(a.layer.at(a.cell), a.label),
  new Given((a.layer === top ? bot : top).at(a.cell), NONE),
]);

// Every other non-grey cell joins exactly one group -- exactly one of its two
// labels is a real label -- while the grey cells join none.
const plainCells = gridCells.filter(
  c => !anchorCells.has(c) && !GREY.includes(c));
const exclusiveKey = Pair.fnToKey((t, u) => (t === NONE) !== (u === NONE), geom);
const exclusive = plainCells.map(
  c => new Pair(exclusiveKey, 'one-group', top.at(c), bot.at(c)));
const greyOut = GREY.flatMap(
  c => [new Given(top.at(c), NONE), new Given(bot.at(c), NONE)]);

// Only the labels whose circle can reach the cell at all are candidates.
const labelDomains = plainCells.flatMap(c => [
  new Given(top.at(c),
    ...anchors.filter(a => a.layer === top && reach.get(a).has(c))
      .map(a => a.label), NONE),
  new Given(bot.at(c),
    ...anchors.filter(a => a.layer === bot && reach.get(a).has(c))
      .map(a => a.label), NONE),
]);

// Sharper than the static domain: a cell d steps from a circle can only be in
// that circle's group when the circle's digit exceeds d, since the group has
// exactly N cells and is connected.
const nearKey = (label, d) => Pair.fnToKey(
  (l, n) => l !== label || n > d, geom);
const nearRules = anchors.flatMap(
  a => [...reach.get(a)].filter(([c]) => c !== a.cell).map(
    ([c, d]) => new Pair(nearKey(a.label, d), 'reach', a.layer.at(c), a.cell)));

const dotRules = dots.map(([a, b]) => new WhiteDot(a, b));

// The 18 group sizes cover the 79 non-grey cells, so the circled digits total
// 79. Row 5 is a whole Sudoku row and always totals 45, leaving 34 for the nine
// circles below it.
const sizeTotal = [new Sum(34, ...lowerCircles)];

// Each group's NFA reads its circle's digit, then alternates label and digit
// over every cell the group could reach.
const scan = (a) => [a.cell, ...[...reach.get(a).keys()].flatMap(
  c => [a.layer.at(c), c])];

// Group size and the shared-parity rule. State: n is the circle's digit, c
// counts the cells carrying this group's label, and act alternates between
// reading a label (-1) and reading the digit of a cell that is in the group (1)
// or not (0). A group member whose digit disagrees in parity with n is
// rejected, as is a count that passes n; accepting on c === n is the size rule.
const groupSpec = (label) => NFA.encodeSpec({
  startState: { n: null },
  transition: (s, v) => {
    if (s.n === null) return { n: v, c: 0, act: -1 };
    if (s.act === -1) return { n: s.n, c: s.c, act: (v === label ? 1 : 0) };
    if (s.act === 0) return { n: s.n, c: s.c, act: -1 };
    if (v % 2 !== s.n % 2) return undefined;
    const c = s.c + 1;
    if (c > s.n) return undefined;
    return { n: s.n, c, act: -1 };
  },
  accept: (s) => s.n !== null && s.c === s.n,
}, geom);
const groupRules = anchors.map(
  a => new NFA(groupSpec(a.label), `${a.group}${a.label}`, ...scan(a)));

// A group is one orthogonally connected region, so the cells carrying a given
// label are one region.
const connectivity = anchors.map(a => new ConnectedValues(a.group, a.label));

return [
  shape,
  top.toVar('row5 groups'),
  bot.toVar('lower groups'),
  digitDomain,
  ...anchorGivens,
  ...greyOut,
  ...labelDomains,
  ...exclusive,
  ...nearRules,
  ...connectivity,
  ...dotRules,
  ...sizeTotal,
  ...groupRules,
];
