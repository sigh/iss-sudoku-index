// Title: Par(i)ty lines
// Author: Quiriqui
// Video: https://www.youtube.com/watch?v=8s3fskojJfw
// Source: https://sudokupad.app/soggzcehcz

// Rules encoded:
// - Normal sudoku.
// - Both lines are parity lines (odd/even alternate along each line).
// - Both lines carry the same sequence of digits. The payload marks neither
//   end of either line, so both orientations are allowed (Or).
// - Anti-knight.
// - Black dot: one digit is double the other; ALL black dots are given, so no
//   other orthogonally adjacent pair may be in a 1:2 ratio.
// - White dot: digits are consecutive; NOT all white dots are given (no
//   negative constraint).
// The flavour text ("came in pairs ... exactly the same") restates the
// same-sequence rule.

// Line A is drawn as two strokes sharing the endpoint R5C8; the rules name
// two lines, so they are joined there (22 cells, like line B).
const strokeA1 = ['R1C5', 'R1C4', 'R2C4', 'R2C5', 'R3C6', 'R2C6', 'R2C7',
  'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C8'];
const strokeA2 = ['R7C6', 'R8C6', 'R8C7', 'R7C7', 'R6C6', 'R5C6', 'R5C7',
  'R6C7', 'R7C8', 'R6C8', 'R5C8'];
const lineA = [...strokeA1, ...strokeA2.slice(0, -1).reverse()];
const lineB = ['R4C5', 'R4C4', 'R3C4', 'R3C3', 'R4C3', 'R4C2', 'R3C2',
  'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R6C5',
  'R6C4', 'R7C4', 'R8C4', 'R7C3', 'R8C2', 'R9C2'];

// Cell-wise equality of the two lines, in one orientation of line B.
const sameSequence = (b) =>
  new And(lineA.map((cell, i) => new SameValues(2, cell, b[i])));

// Drawn dots (payload ratio / difference entries).
const blackDots = [['R1C2', 'R2C2'], ['R3C4', 'R2C4'], ['R4C5', 'R5C5']];
const whiteDots = [['R5C2', 'R5C3'], ['R3C7', 'R3C8']];

// Every orthogonal edge without a black dot must not be in a 1:2 ratio.
// Edges are grouped by direction and replicated from a template edge at
// R1C1; each target is the left (or top) cell of an undotted edge.
const graph = cellGraph('9x9');
const notRatio2 = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const edgeKey = (p, q) => [p, q].sort().join('|');
const blackEdges = new Set(blackDots.map(([p, q]) => edgeKey(p, q)));
const undottedStarts = (dr, dc) => {
  const starts = [];
  for (let r = 1; r + dr <= 9; r++) {
    for (let c = 1; c + dc <= 9; c++) {
      const edge = edgeKey(makeCellId(r, c), makeCellId(r + dr, c + dc));
      if (!blackEdges.has(edge)) starts.push(makeCellId(r, c));
    }
  }
  return starts;
};
const noOtherBlackDots = [[0, 1, 'R1C2'], [1, 0, 'R2C1']].map(
  ([dr, dc, neighbour]) => graph.makeReplicate(
    new Pair(notRatio2, 'not 1:2', 'R1C1', neighbour),
    undottedStarts(dr, dc),
  ));

return [
  new Shape('9x9'),
  new Modular(2, ...lineA),
  new Modular(2, ...lineB),
  new Or([sameSequence(lineB), sameSequence([...lineB].reverse())]),
  new AntiKnight(),
  ...blackDots.map(([p, q]) => new BlackDot(p, q)),
  ...noOtherBlackDots,
  ...whiteDots.map(([p, q]) => new WhiteDot(p, q)),
];
