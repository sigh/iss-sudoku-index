// Title: The Wizard's Cage
// Author: Orvos
// Video: https://www.youtube.com/watch?v=I0E_SvJh3KY
// Source: https://app.crackingthecryptic.com/sudoku/4NNnFR2Td8

// Normal sudoku rules apply (default Shape). Neighbouring digits along the
// green line must differ by at least 5 -- Whisper(5) on its 4 cells.
//
// "Digits in a cage must sum to the cage total" names no printed number
// anywhere: a cage's total is nothing but the sum of its own cells, so that
// sentence never becomes an independent constraint by itself -- it only
// supplies the quantity the next two rules compare. Those two rules are what
// get encoded: every cage total is unique, and every pair of orthogonally
// adjacent cages (a cell of one touching a cell of the other) has totals
// that differ by exactly 1.
//
// Both comparisons are built as one shared multi-segment NFA family
// (diffMachine): scan one cage's cells, a SEGMENT_BREAK, then the other
// cage's cells, accumulating diff = sum(segment 2) - sum(segment 1); accept
// on whatever relation the caller wants. This keeps every comparison on the
// grid's native 1-9 alphabet -- a 2-cell cage's total can reach 17, above
// the grid's digit range, so materializing "the total" as its own cell/Var
// and comparing those with AllDifferent would need an 17-value domain,
// which exceeds CellGeometry.MAX_SIZE (16).
//
// Every cage below is a 1- or 2-cell group (see the per-cage comment); every
// 2-cell cage's two cells share a row or a column, so ordinary sudoku
// already forces that cage's own digits apart. No separate
// Cage/AllDifferent is added for cage membership itself.

const cages = [
  { cells: ['R1C2', 'R2C2'] },   // drawn cage 1
  { cells: ['R1C3', 'R2C3'] },   // drawn cage 2
  { cells: ['R4C3', 'R5C3'] },   // drawn cage 3
  { cells: ['R5C2', 'R6C2'] },   // drawn cage 4
  { cells: ['R7C3'] },           // drawn cage 5, single-cell cage
  { cells: ['R8C3'] },           // drawn cage 6, single-cell cage
  { cells: ['R7C1', 'R8C1'] },   // drawn cage 7
  { cells: ['R9C1', 'R9C2'] },   // drawn cage 8
  { cells: ['R8C6', 'R9C6'] },   // drawn cage 9
  { cells: ['R6C5', 'R6C6'] },   // drawn cage 10
  { cells: ['R6C4', 'R7C4'] },   // drawn cage 11
  { cells: ['R4C5', 'R4C6'] },   // drawn cage 12
  { cells: ['R4C7', 'R4C8'] },   // drawn cage 13
  { cells: ['R1C6', 'R2C6'] },   // drawn cage 14
  { cells: ['R1C7', 'R1C8'] },   // drawn cage 15
  { cells: ['R7C8', 'R7C9'] },   // drawn cage 16
  { cells: ['R8C9', 'R9C9'] },   // drawn cage 17
];

// Orthogonal adjacency, derived from the cage cell lists above rather than
// hand-listed.
const graph = cellGraph('9x9');
const cellsAdjacent = (a, b) => graph.neighbours(a).includes(b);
const cagesAdjacent = (ca, cb) =>
  ca.cells.some(a => cb.cells.some(b => cellsAdjacent(a, b)));

// diffMachine(accept): state {seg, diff}. `seg` is which of the two
// segments (cages) is currently being read; `diff` accumulates
// -sum(segment 1) while seg === 0, then +sum(segment 2) once seg === 1, so
// the final diff is sum(segment 2) - sum(segment 1).
const diffMachine = (accept) => NFA.encodeSpec({
  startState: { seg: 0, diff: 0 },
  transition: ({ seg, diff }, value) => {
    if (value === SEGMENT_BREAK) return { seg: 1, diff };
    const sign = seg === 0 ? -1 : 1;
    return { seg, diff: diff + sign * value };
  },
  accept: ({ diff }) => accept(diff),
  // Every cage here is at most 2 cells, so every real scan is at most
  // 2 + 1(break) + 2 = 5 symbols; bound compile-time state exploration to
  // that depth so the diff field doesn't have to be clamped/unbounded.
  maxDepth: 5,
}, 9, { multiSegment: true });

const totalsDifferNFA = diffMachine(diff => diff !== 0);
const consecutiveTotalsNFA = diffMachine(diff => diff === 1 || diff === -1);

// Every cage total throughout the puzzle is unique.
const uniqueTotalConstraints = [];
// Orthogonally adjacent cages have consecutive cage totals.
const consecutiveTotalConstraints = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    uniqueTotalConstraints.push(
      new NFA(totalsDifferNFA, 'cage-totals-differ', cages[i].cells, cages[j].cells));
    if (cagesAdjacent(cages[i], cages[j])) {
      consecutiveTotalConstraints.push(
        new NFA(consecutiveTotalsNFA, 'cage-totals-consecutive', cages[i].cells, cages[j].cells));
    }
  }
}

return [
  new Shape('9x9'),
  new Given('R1C1', 1),

  // Green line (drawn as the single yellow-green #a3e048 stroke; the only
  // line in the puzzle, running R6C2-R5C2-R5C3-R4C3).
  new Whisper(5, 'R6C2', 'R5C2', 'R5C3', 'R4C3'),

  ...uniqueTotalConstraints,
  ...consecutiveTotalConstraints,
];
