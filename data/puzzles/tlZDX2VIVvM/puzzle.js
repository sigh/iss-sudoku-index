// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=tlZDX2VIVvM
// Source: https://cracking-the-cryptic.web.app/sudoku/tjNL4d4tgn

// Normal Sudoku rules apply. There are no given digits.
//
// Twenty-four killer cages are outlined and none carries a printed total.
// Digits do not repeat within a cage.
//
// Fifteen arithmetic glyphs are printed on cell borders. Every glyph sits on a
// border between two different cages and relates the totals of those two
// cages: "+" and "x" combine them, "=" makes them equal, and a chevron makes
// the total on its point side the smaller. The glyphs link the cages into nine
// disjoint chains. A three-cage chain carries one arithmetic glyph and one "=",
// and reads as the infix equation "A <op> B = C": the two cages joined by the
// arithmetic glyph are the operands and the cage on the far side of the "=" is
// the result. A two-cage chain states its single relation directly.
//
// The source payload carries no rules text. The ruleset above comes from the
// video description, which links this exact source URL and calls the puzzle a
// Killer Sudoku variant, together with the drawn art: the cages have no totals,
// so the totals must come from the glyphs, and every glyph is drawn on a
// cage-to-cage border. The nine chains that the fifteen glyphs induce are
// disjoint, cover all twenty-four cages, have no cage touching three glyphs,
// and every three-cage chain contains exactly one "=" -- the reading that makes
// each chain a single arithmetic statement.

// Cages, as outlined; cell order as drawn.
const CAGES = [
  ['R2C2', 'R2C3', 'R3C3'],
  ['R3C4'],
  ['R4C4', 'R4C5'],
  ['R4C6'],
  ['R5C3', 'R5C4', 'R5C5'],
  ['R5C6'],
  ['R4C7', 'R5C7', 'R6C7', 'R6C8'],
  ['R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9'],
  ['R1C8', 'R2C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R8C8'],
  ['R7C8'],
  ['R7C7'],
  ['R8C7', 'R8C6', 'R8C5', 'R7C6'],
  ['R7C5', 'R7C4', 'R8C4', 'R9C4', 'R9C3'],
  ['R9C2'],
  ['R8C2', 'R7C2'],
  ['R7C3', 'R6C3'],
  ['R6C4'],
  ['R9C1'],
  ['R8C1'],
  ['R7C1', 'R6C1', 'R6C2'],
  ['R4C1', 'R5C1', 'R5C2', 'R4C2'],
  ['R3C2'],
];

// Border glyphs, as drawn: [glyph, cellA, cellB], the mark being centred on the
// border those two cells share. Twelve are printed characters. The "=" between
// R6C7 and R7C7 is drawn instead as two short parallel strokes laid across that
// horizontal border -- an "=" rotated to sit on a horizontal edge, the six
// printed "=" marks all sitting on vertical edges. The last two entries are
// chevrons: a "v" centred on the border whose apex lies in the second cell
// named, which is therefore the smaller side.
const GLYPHS = [
  ['+', 'R3C2', 'R4C2'],
  ['+', 'R6C2', 'R6C3'],
  ['=', 'R3C3', 'R3C4'],
  ['=', 'R5C2', 'R5C3'],
  ['=', 'R9C2', 'R9C3'],
  ['=', 'R8C8', 'R8C9'],
  ['=', 'R2C8', 'R2C9'],
  ['=', 'R6C3', 'R6C4'],
  ['=', 'R6C7', 'R7C7'],
  ['x', 'R3C4', 'R4C4'],
  ['x', 'R8C2', 'R9C2'],
  ['x', 'R7C6', 'R7C7'],
  ['x', 'R7C8', 'R8C8'],
  ['>', 'R8C1', 'R9C1'],
  ['>', 'R4C6', 'R5C6'],
];

const cageOfCell = new Map();
CAGES.forEach((cells, i) => cells.forEach((cell) => cageOfCell.set(cell, i)));

// Each glyph is an edge between the two cages on either side of its border.
const edges = GLYPHS.map(
  ([op, a, b]) => ({ op, a: cageOfCell.get(a), b: cageOfCell.get(b) }));

// Group the edges into chains: the connected components of that cage graph.
const root = CAGES.map((_, i) => i);
const find = (i) => (root[i] === i ? i : (root[i] = find(root[i])));
edges.forEach((e) => { root[find(e.a)] = find(e.b); });
const chains = new Map();
edges.forEach((e) => {
  const key = find(e.a);
  chains.set(key, (chains.get(key) || []).concat([e]));
});

// Smallest and largest total a cage of n distinct digits 1-9 can hold:
// 1+2+...+n and 9+8+...+(10-n).
const minTotal = (n) => (n * (n + 1)) / 2;
const maxTotal = (n) => (n * (19 - n)) / 2;

const equalTotals = (i, j) => new EqualSum(CAGES[i], CAGES[j]);

// total(i) + total(j) = total(k): the cages are disjoint, so the two operand
// cages together are one cell set whose total equals the result cage's.
const sumTotals = (i, j, k) => new EqualSum(
  [...CAGES[i], ...CAGES[j]], CAGES[k]);

// total(i) * total(j) = total(k). A product is not linear, so branch on the
// total of the smaller operand cage: each branch fixes that total to one value
// it could take and then multiplies the other operand by that value as a Sum
// coefficient, which is linear. The branches are exhaustive over the operand's
// possible totals, so the disjunction is exactly the product rule.
// (A multiplier of 1 leaves the two cell sets with equal totals.)
const productTotals = (i, j, k) => {
  const [pinned, scaled] = CAGES[i].length <= CAGES[j].length ? [i, j] : [j, i];
  const lo = minTotal(CAGES[pinned].length);
  const hi = maxTotal(CAGES[pinned].length);
  return new Or(
    Array.from({ length: hi - lo + 1 }, (_, n) => lo + n).map((total) => new And([
      new Sum(total, ...CAGES[pinned]),
      total === 1
        ? new EqualSum(CAGES[scaled], CAGES[k])
        : new Sum(
          0,
          ...CAGES[scaled].map((cell) => [cell, total]),
          ...CAGES[k].map((cell) => [cell, -1])),
    ])));
};

const chainConstraint = (chain) => {
  if (chain.length === 1) {
    const e = chain[0];
    if (e.op === '=') return equalTotals(e.a, e.b);
    // Both chevrons join two single-cell cages, so "the point side holds the
    // smaller total" is the ordinary inequality between those two cells.
    return new GreaterThan(CAGES[e.a][0], CAGES[e.b][0]);
  }
  const eq = chain.find((e) => e.op === '=');
  const op = chain.find((e) => e.op !== '=');
  // The result cage is the end of the "=" edge that the operator edge misses.
  const result = (eq.a === op.a || eq.a === op.b) ? eq.b : eq.a;
  return op.op === '+'
    ? sumTotals(op.a, op.b, result)
    : productTotals(op.a, op.b, result);
};

return [
  new Shape('9x9'),
  // Cage total 0 means "no total": distinctness only.
  ...CAGES.map((cells) => new Cage(0, ...cells)),
  ...Array.from(chains.values(), chainConstraint),
];
