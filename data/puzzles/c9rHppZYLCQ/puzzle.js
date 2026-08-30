// Title: An EPIC Sandwich Sudoku
// Author: Matyas Martinka
// Video: https://www.youtube.com/watch?v=c9rHppZYLCQ
// Source: https://cracking-the-cryptic.web.app/sudoku/LN7qpPB43L

// Standard sudoku (default row/column/box all-different, no givens).
// Eight lines -- columns 3, 5, 7, 8 and rows 2, 4, 5, 7 -- each carry a pair
// of outside clues, one at each end (values transcribed from the payload's
// overlay array). Per the rules, one clue in each pair gives the sum of the
// digits strictly between the 1 and the 9 in that row/column, and the other
// gives the sum of the digits strictly between the 5 and the 7 -- but the
// rules never say which end holds which sum, so each line is encoded as a
// disjunction over both assignments (the correspondence is open per line,
// independently of the other seven lines).

const graph = cellGraph();
const geometry = cellGeometry();

// Sum of the digits strictly between the cells holding `lowValue` and
// `highValue` on a 9-cell line, in either order, must equal `target`. No
// built-in class covers an arbitrary pair of anchor digits -- `Sandwich` is
// hardwired to 1 and 9 -- so this is a custom NFA. It tracks a phase (before
// / between / after the anchor digits) and a running sum, clamped once the
// sum can only fail, keeping the compiled state count small.
function sandwichBetween(lowValue, highValue, target, cells, label) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'before', sum: 0 },
    transition: ({ phase, sum }, value) => {
      const isAnchor = value === lowValue || value === highValue;
      if (phase === 'before') {
        return isAnchor ?
          { phase: 'between', sum: 0 } : { phase: 'before', sum: 0 };
      }
      if (phase === 'between') {
        if (isAnchor) return { phase: 'after', sum };
        return { phase: 'between', sum: Math.min(sum + value, target + 1) };
      }
      return { phase: 'after', sum };
    },
    accept: ({ phase, sum }) => phase === 'after' && sum === target,
  }, 9);
  return new NFA(spec, label, ...cells);
}

// One reading of a line's clue pair: `oneNineValue` clues the 1-9 sandwich,
// `fiveSevenValue` clues the 5-7 sandwich. `Sandwich.fromCells` derives the
// canonical arrow id from the line's cells, direction included; the sum
// between two anchors doesn't care which way the line is read, so the same
// clue covers either end of the line.
function oneReading(cells, oneNineValue, fiveSevenValue, label) {
  return new And([
    Sandwich.fromCells(oneNineValue, cells, geometry),
    sandwichBetween(5, 7, fiveSevenValue, cells, label),
  ]);
}

// Either end of the line could hold either sum; disjoin over the two
// assignments.
function eitherReading(cells, endA, endB, labelPrefix) {
  return new Or([
    oneReading(cells, endA, endB, `${labelPrefix}a`),
    oneReading(cells, endB, endA, `${labelPrefix}b`),
  ]);
}

const lineClues = [
  { cells: graph.column(3), endA: 6, endB: 6, label: 'c3' },
  { cells: graph.column(5), endA: 1, endB: 27, label: 'c5' },
  { cells: graph.column(7), endA: 11, endB: 22, label: 'c7' },
  { cells: graph.column(8), endA: 5, endB: 5, label: 'c8' },
  { cells: graph.row(2), endA: 9, endB: 9, label: 'r2' },
  { cells: graph.row(4), endA: 5, endB: 5, label: 'r4' },
  { cells: graph.row(5), endA: 7, endB: 14, label: 'r5' },
  { cells: graph.row(7), endA: 8, endB: 8, label: 'r7' },
];

return [
  new Shape('9x9'),
  ...lineClues.map(({ cells, endA, endB, label }) =>
    eitherReading(cells, endA, endB, label)),
];
