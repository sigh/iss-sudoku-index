// Title: Genus 3
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=9F2mL_L-YFo
// Source: https://sudokupad.app/f0zxtm2lrs

// Nine non-overlapping 3x3 regions contain 1-9 once each; all remaining cells
// are empty. Digits do not repeat in a row or column. The grey thermometer
// increases from R4C3 to R3C4. Outside-diagonal sums satisfy their shown
// inequalities and the x, y, z relationships. Fog/revealing is UI-only.
// Rows/columns don't repeat-check by default, so the grid is Raw: no
// implicit constraints; rows/columns are stated explicitly below.
const shape = new Shape('11x11', '1-10', 'Raw');
const graph = cellGraph(shape);
const cell = (row, col) => makeCellId(row, col);
const rows = Array.from({ length: 11 }, (_, r) =>
  Array.from({ length: 11 }, (_, c) => cell(r + 1, c + 1)));
const columns = Array.from({ length: 11 }, (_, c) =>
  Array.from({ length: 11 }, (_, r) => cell(r + 1, c + 1)));
const block = (row, col) =>
  Array.from({ length: 3 }, (_, dr) =>
    Array.from({ length: 3 }, (_, dc) => cell(row + dr, col + dc))).flat();

// The 81 possible drawn 3x3 placements are selection bits. A selected placement
// contains 1-9 exactly once; its flag also makes each covered board cell nonzero.
const placements = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) => ({ row: r + 1, col: c + 1 }))).flat();
const selectorVars = new Var('S', '3x3 region placement flags', placements.length);
const selectors = selectorVars.cells();
const occupiedVars = new Var('O', 'filled-cell flags', '11x11');
const occupied = occupiedVars.cells();
const biasVars = new Var('B', 'one-valued coverage offsets', 8);
const bias = biasVars.cells();
const occupationKey = Pair.fnToKey((digit, flag) =>
  (flag === 1 && digit === 10) || (flag === 2 && digit <= 9), 10);

// This NFA permits repeated blank markers (10) but rejects a repeated digit.
const noRepeatedDigit = NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    if (value === 10) return { seen };
    const bit = 1 << (value - 1);
    return (seen & bit) ? undefined : { seen: seen | bit };
  },
  accept: () => true,
  maxDepth: 11,
}, 10);
const noRepeat = cells => new NFA(noRepeatedDigit, 'no-repeat-nonzero', cells);
const sumBound = (name, min, max, cells) => {
  const cap = max === null ? min : max + 1;
  const nfa = NFA.encodeSpec({
    startState: { sum: 0 },
    transition: ({ sum }, value) => ({ sum: Math.min(cap, sum + (value === 10 ? 0 : value)) }),
    accept: ({ sum }) => sum >= min && (max === null || sum <= max),
    maxDepth: cells.length,
  }, 10);
  return new NFA(nfa, name, cells);
};

const diagonal = (row, col, dr, dc) => {
  const cells = [];
  while (row >= 1 && row <= 11 && col >= 1 && col <= 11) {
    cells.push(cell(row, col));
    row += dr;
    col += dc;
  }
  return cells;
};
// The following paths are transcribed from the twelve outside arrows and badges.
const diagonals = {
  a: diagonal(1, 4, 1, -1), b: diagonal(1, 7, 1, -1),
  c: diagonal(1, 9, 1, -1), d: diagonal(4, 11, 1, -1),
  e: diagonal(6, 11, -1, -1), f: diagonal(8, 11, -1, -1),
  g: diagonal(11, 3, -1, 1), h: diagonal(11, 5, -1, 1),
  i: diagonal(11, 6, -1, 1), j: diagonal(8, 1, -1, 1),
  k: diagonal(6, 1, 1, 1), l: diagonal(4, 1, 1, 1),
};
const flagFor = square => occupied[graph.cells().indexOf(square)];
const effectiveTerms = (cells, coefficient = 1) => [
  ...cells,
  ...cells.flatMap(square => Array.from({ length: 10 * coefficient }, () => flagFor(square))),
];
const shiftedSum = (total, cells) => new Sum(total + 20 * cells.length, ...cells,
  ...cells.map(square => [flagFor(square), 10]));

const placementsConstraints = placements.flatMap(({ row, col }, i) => {
  const cells = block(row, col);
  return [new Or([
    new Given(selectors[i], 1),
    new And([new Given(selectors[i], 2), new ContainExact('1_2_3_4_5_6_7_8_9', ...cells)]),
  ])];
});
const coverageConstraints = rows.flatMap((row, r) => row.map((square, c) => {
  const flags = placements.flatMap(({ row: top, col: left }, i) =>
    r + 1 >= top && r + 1 < top + 3 && c + 1 >= left && c + 1 < left + 3
      ? [selectors[i]] : []);
  return [
    new EqualSum(flags, [occupied[r * 11 + c], ...bias.slice(0, flags.length - 1)]),
    new Pair(occupationKey, 'occupied-exactly-when-nonzero', square, occupied[r * 11 + c]),
  ];
})).flat();

return [
  shape,
  selectorVars,
  occupiedVars,
  biasVars,
  ...bias.map(square => new Given(square, 1)),
  new Sum(90, ...selectors),
  ...placementsConstraints,
  ...coverageConstraints,
  ...rows.map(noRepeat),
  ...columns.map(noRepeat),
  new Given(cell(4, 3), 1, 2, 3, 4, 5, 6, 7, 8, 9),
  new Given(cell(3, 4), 1, 2, 3, 4, 5, 6, 7, 8, 9),
  new Thermo(cell(4, 3), cell(3, 4)),
  sumBound('sum-under-23', 0, 22, diagonals.a),
  sumBound('sum-over-17', 18, null, diagonals.c),
  sumBound('sum-over-16', 17, null, diagonals.g),
  sumBound('sum-over-32', 33, null, diagonals.i),
  new EqualSum(effectiveTerms(diagonals.b), effectiveTerms(diagonals.h)),
  new Sum(696, ...diagonals.f, ...diagonals.f.map(square => [flagFor(square), 10]),
    ...diagonals.b.map(square => [square, 3]), ...diagonals.b.map(square => [flagFor(square), 30])),
  new Sum(30, ...diagonals.l, ...diagonals.l.map(square => [flagFor(square), 10]),
    ...diagonals.b.map(square => [square, -1]), ...diagonals.b.map(square => [flagFor(square), -10])),
  shiftedSum(6, [...diagonals.d, ...diagonals.j]),
  shiftedSum(52, [...diagonals.e, ...diagonals.k]),
];
