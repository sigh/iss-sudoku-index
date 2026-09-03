// Title: Vicissitudes
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=_u1SXY_VatM
// Source: https://sudokupad.app/b3wa450x40

// Rules:
//   Normal sudoku rules apply.
//   Shade some cells so that all shaded cells are orthogonally connected, and
//   all unshaded cells are orthogonally connected. No 2x2 area may be
//   completely shaded or unshaded.
//   The shading splits the line into segments with equal sums. Digits may not
//   repeat within a segment.
// The grid has no given digits. Nothing is omitted.

// The line is drawn as a single closed loop, so its segments are the maximal
// runs of equally shaded cells around the cycle, with no first or last segment
// to treat specially.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Corners of the drawn light-blue loop, in drawing order and closing back onto
// the first; consecutive corners are joined by a straight run of cells, which
// may be orthogonal or diagonal.
const loopCorners = [
  'R6C5', 'R6C6', 'R9C6', 'R9C9', 'R8C9', 'R6C7', 'R5C8', 'R5C9', 'R4C9',
  'R3C8', 'R3C9', 'R1C7', 'R1C6', 'R2C5', 'R1C4', 'R1C3', 'R3C1', 'R3C2',
  'R2C3', 'R2C4', 'R3C5', 'R3C6', 'R5C6', 'R5C5', 'R6C4', 'R5C4', 'R4C5',
  'R3C4', 'R3C3', 'R5C3', 'R5C2', 'R4C1', 'R5C1', 'R6C2', 'R6C3', 'R7C3',
  'R7C1', 'R9C1', 'R9C2', 'R8C2', 'R8C3', 'R9C3', 'R8C4', 'R7C4',
];

// The cells of one corner-to-corner run, from `from` up to but excluding `to`.
const runFrom = (from, to) => {
  const a = parseCellId(from);
  const b = parseCellId(to);
  const length = Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col));
  const dR = (b.row - a.row) / length;
  const dC = (b.col - a.col) / length;
  return Array.from(
    { length }, (_, i) => makeCellId(a.row + dR * i, a.col + dC * i));
};

// The loop's 55 cells in traversal order; loop[i] is followed by loop[i + 1],
// and loop[54] by loop[0].
const loop = loopCorners.flatMap(
  (corner, i) => runFrom(corner, loopCorners[(i + 1) % loopCorners.length]));

const shade = graph.makeOverlay('YY');

// Position of a loop cell within its own segment, counting from 1 at the cell
// that follows a shading change. A segment holds distinct digits, so it spans
// at most 9 cells and the count never has to leave the 1-9 range.
const SEGMENT_CELL_LIMIT = 9;
const segPos = graph.makeOverlay('VP', loop);
const nextPosition = Pair.fnToKey((a, b) => b === a + 1, shape);

// The sum every segment shares. It ranges over 1-45, more than the 9 values a
// cell can hold, so it is carried base 9 across two cells as
// 9 * (VT1 - 1) + (VT2 - 1); VT1 stops at 6 because 9 distinct digits sum to at
// most 45. Each segment's Sum below reads it as those two coefficient terms.
const total = new Var('T', 'total', 2);
const totalTerms = [[total.cell(1), -9], [total.cell(2), -1]];

// One rule per loop cell, covering the two mutually exclusive cases: the
// segment runs on into the next loop cell, or it ends at this cell. Ending at
// position L identifies the segment as the L cells up to and including this
// one, since the position count only reaches L by incrementing from 1 there.
// Together these also force at least one shading change: the positions cannot
// increment the whole way around the cycle.
const segmentRules = loop.map((cell, i) => {
  const next = loop[(i + 1) % loop.length];
  return new Or([
    new And([
      new SameValues(2, shade.at(cell), shade.at(next)),
      new Pair(nextPosition, 'nextPosition', segPos.at(cell), segPos.at(next)),
    ]),
    ...Array.from({ length: SEGMENT_CELL_LIMIT }, (_, k) => {
      const length = k + 1;
      const segment = Array.from(
        { length },
        (_, j) => loop[(i + 1 - length + j + loop.length) % loop.length]);
      return new And([
        // Two shades, so "differs from" is all-different.
        new AllDifferent(shade.at(cell), shade.at(next)),
        new Given(segPos.at(cell), length),
        new Given(segPos.at(next), 1),
        ...(length > 1 ? [new AllDifferent(...segment)] : []),
        new Sum(-10, ...segment, ...totalTerms),
      ]);
    }),
  ]);
});

return [
  shape,
  new YinYang(),
  segPos.toVar('segpos'),
  total,
  new Given(total.cell(1), 1, 2, 3, 4, 5, 6),
  // No rule tells the two shades apart -- every clue above reads them only as
  // "same" or "different" -- so solutions come in swapped pairs. Pin the first
  // cell in reading order to one shade to keep a single representative.
  new Given(shade.at('R1C1'), 1),
  ...segmentRules,
];
