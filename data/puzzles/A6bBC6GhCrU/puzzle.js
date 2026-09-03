// Title: Bodysnatchers
// Author: AnalyticalNinja and Kafkapharnaum
// Video: https://www.youtube.com/watch?v=A6bBC6GhCrU
// Source: https://sudokupad.app/e0l316poog

// Rules encoded here, in full:
//  - Normal sudoku.
//  - Exactly one Doubler cell in every row, column and box; the nine Doublers
//    hold a full set of the digits 1-9; a Doubler's value is twice its digit.
//  - Exactly one Body Snatcher cell in every row, column and box; the nine
//    Snatchers hold a full set of the digits 1-9; no cell is both.
//  - A Body Snatcher's value is exactly one more or one less than the value of
//    one of its orthogonal neighbours, and that neighbour is in the Snatcher's
//    own box.
//  - Each purple line holds a set of consecutive, non-repeating VALUES, in any
//    order. Digits may repeat along a line; only values must not.
// Nothing is omitted.
//
// Every cell therefore carries a "value" as well as a digit: the digit for a
// plain cell, twice the digit for a Doubler, and a neighbour's value plus or
// minus one for a Snatcher (a Snatcher's own digit does not enter its value).
// Values run 0..19 (a Snatcher beside a doubled 9 reaches 19; a Snatcher beside
// a 1 reaches 0), which is past ISS's 16-value alphabet limit, so a value is
// carried by two overlay cells: value = 2 * VQ + VP with VP in {0, 1}.

const shape = new Shape('9x9', '0-9');   // 0 is for the overlays; digits below stay 1-9
const graph = cellGraph(shape);
const cells = graph.cells();
const houses = graph.rowsColumnsBoxes();

const dbl = graph.makeOverlay('VD');     // 0, or the digit when the cell is a Doubler
const snt = graph.makeOverlay('VS');     // 0, or the digit when the cell is a Body Snatcher
const half = graph.makeOverlay('VQ');    // floor(value / 2)
const par = graph.makeOverlay('VP');     // value mod 2

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const value = cell => [[half.at(cell), 2], [par.at(cell), 1]];
const negValue = cell => [[half.at(cell), -2], [par.at(cell), -1]];

// A mask cell is either 0 or a copy of its own cell's digit.
const maskKey = Pair.fnToKey((digit, mask) => mask === 0 || mask === digit, shape);
// A Doubler cell is never also a Body Snatcher, so the two masks never both fire.
const disjointKey = Pair.fnToKey((a, b) => a === 0 || b === 0, shape);
const differKey = Pair.fnToKey((a, b) => a !== b, shape);

const boxOf = new Map();
graph.boxes().forEach((box, i) => box.forEach(cell => boxOf.set(cell, i)));

const renbans = [
  // Purple lines, in drawing order, with the diagonal steps between waypoints
  // expanded into the cells they cross.
  ['R8C8', 'R7C8', 'R6C7', 'R5C8', 'R4C9', 'R3C8', 'R2C8', 'R1C8', 'R2C7',
    'R3C7', 'R2C6', 'R3C6', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R5C2', 'R5C3',
    'R6C4', 'R6C5'],
  ['R5C6', 'R6C6', 'R5C7', 'R4C8'],
  ['R2C2', 'R3C2', 'R4C1', 'R5C1', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R7C4',
    'R8C4', 'R9C5'],
  ['R9C7', 'R9C6', 'R8C5', 'R7C6'],
  ['R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R3C4', 'R2C5', 'R1C5', 'R1C6'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R8C1', 'R9C1', 'R8C2'],
];
const lineCells = renbans.flat();

// Per line: a window base B, and per line cell an offset into that window, both
// split the same way as a value. L distinct values all sitting in the window
// [B, B + L - 1] is exactly "a set of L consecutive, non-repeating values".
const baseHalf = new Var('E', 'renban window base: floor(base / 2)', renbans.length);
const basePar = new Var('F', 'renban window base: base mod 2', renbans.length);
const offHalf = new Var('G', 'renban offset: floor(offset / 2)', lineCells.length);
const offPar = new Var('H', 'renban offset: offset mod 2', lineCells.length);
const offsetOf = new Map(lineCells.map((cell, i) => [cell, i + 1]));

// offset = 2 * VG + VH lies in [0, L - 1], with VH the low bit so that each
// offset has exactly one representation.
const offsetKeys = new Map([...new Set(renbans.map(line => line.length))].map(
  length => [length, Pair.fnToKey((g, h) => h <= 1 && 2 * g + h <= length - 1, shape)]));

const renbanConstraints = renbans.flatMap((line, i) => {
  const base = [[baseHalf.cell(i + 1), -2], [basePar.cell(i + 1), -1]];
  const window = line.flatMap(cell => {
    const n = offsetOf.get(cell);
    return [
      new Sum(0, ...value(cell), ...base,
        [offHalf.cell(n), -2], [offPar.cell(n), -1]),
      new Pair(offsetKeys.get(line.length), 'offset in window',
        offHalf.cell(n), offPar.cell(n)),
    ];
  });
  // Values distinct: two cells differ if either half of the value differs.
  const distinct = line.flatMap((a, j) => line.slice(j + 1).map(b => new Or([
    new Pair(differKey, 'different value', half.at(a), half.at(b)),
    new Pair(differKey, 'different value', par.at(a), par.at(b)),
  ])));
  return [new Given(basePar.cell(i + 1), 0, 1), ...window, ...distinct];
});

return [
  shape,
  dbl.toVar('Doubler digit (0 = not a Doubler)'),
  snt.toVar('Body Snatcher digit (0 = not a Snatcher)'),
  half.toVar('value: floor(value / 2)'),
  par.toVar('value: value mod 2'),
  baseHalf, basePar, offHalf, offPar,

  // The alphabet carries 0 for the overlays; grid digits stay 1-9.
  graph.makeReplicate(new Given(cells[0], ...DIGITS), cells),
  par.makeReplicate(new Given(par.cells()[0], 0, 1), par.cells()),

  ...cells.map(cell => new Pair(maskKey, 'Doubler digit', cell, dbl.at(cell))),
  ...cells.map(cell => new Pair(maskKey, 'Snatcher digit', cell, snt.at(cell))),
  ...cells.map(cell => new Pair(
    disjointKey, 'Doubler and Snatcher disjoint', dbl.at(cell), snt.at(cell))),

  // Exactly one Doubler and one Snatcher per house: eight of the nine masks are 0.
  ...houses.map(house => new ContainExact('0_0_0_0_0_0_0_0', ...dbl.at(house))),
  ...houses.map(house => new ContainExact('0_0_0_0_0_0_0_0', ...snt.at(house))),
  // The nine Doublers, and the nine Snatchers, each hold a full set of 1-9.
  new ContainExact(DIGITS.join('_'), ...dbl.cells()),
  new ContainExact(DIGITS.join('_'), ...snt.cells()),

  // Each cell falls in exactly one of the three branches, since a non-zero mask
  // marks the role and the two masks are disjoint.
  ...cells.map(cell => new Or([
    // Doubler: value = 2 * digit, which is even, so VQ is the digit and VP is 0.
    new And([
      new Given(dbl.at(cell), ...DIGITS),
      new SameValues(2, cell, half.at(cell)),
      new Given(par.at(cell), 0),
    ]),
    // Body Snatcher: value = host value +/- 1, over the hosts the rule allows.
    // A host can never itself be a Snatcher, there being only one per box, so
    // the host's own value is fixed by one of the other two branches.
    new And([
      new Given(snt.at(cell), ...DIGITS),
      new Or(graph.neighbours(cell)
        .filter(host => boxOf.get(host) === boxOf.get(cell))
        .flatMap(host => [
          new Sum(1, ...value(cell), ...negValue(host)),
          new Sum(1, ...value(host), ...negValue(cell)),
        ])),
    ]),
    // Neither: value = digit.
    new And([
      new Given(dbl.at(cell), 0),
      new Given(snt.at(cell), 0),
      new Sum(0, cell, ...negValue(cell)),
    ]),
  ])),

  ...renbanConstraints,
];
