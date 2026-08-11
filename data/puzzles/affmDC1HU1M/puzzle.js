// Title: Corridors
// Author: vidarino
// Video: https://www.youtube.com/watch?v=affmDC1HU1M
// Source: https://app.crackingthecryptic.com/sudoku/MTTm2LtHRG

// Rules encoded: standard row/column all-different (Shape('9x9')); nine
// solver-discovered orthogonally-connected 9-cell regions, each an
// all-different set (ChaosConstruction, with NoBoxes replacing the fixed
// 3x3 boxes); "a region cannot contain a 2x2 block of cells" (no 2x2 window
// of the CC region-label overlay may be monochrome); 17 outside "sum to the
// next region border" clues; 11 in-grid "corridor" arrows, each a digit
// cell N marking a straight run of N same-region cells that is bounded on
// both ends by either a different region or the grid edge.
//
// The source draws every corridor arrow with two opposite arrowheads along
// one axis, never a single directional head, so neither which side of the
// marked cell the corridor extends toward, nor where the marked cell sits
// inside the run, is fixed by the art. Both are left open by the rules text
// too ("an arrow indicates a ... corridor ... where N is the digit in that
// cell" never calls the marked cell an endpoint). This is encoded as a full
// disjunction over every window containing the marked cell, not a choice of
// one reading.
//
// No omissions: every outside clue, every arrow, and both base region rules
// (connected 9-cell all-different regions; no 2x2 monochrome block) are
// encoded.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
// The chaos-construction region-label cell paired with each grid cell; CC's
// var group is declared by ChaosConstruction itself, so this overlay is only
// used to reference those cells, never to redeclare them.
const cc = graph.makeOverlay('CC');
const gridCells = graph.cells();

const equalKey = Pair.fnToKey((a, b) => a === b, 9);
const notEqualKey = Pair.fnToKey((a, b) => a !== b, 9);

// "A region cannot contain a 2x2 block of cells": no 2x2 window of CC labels
// may hold a single repeated value. One "not all four equal" NFA on the
// top-left window, replicated to every window origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = cc.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...cc.at(graph.block(gridCells[0], 2, 2))),
  cc.at(blockOrigins));

// The 9 grid cells and 9 paired CC cells of one row/column, ordered from the
// named edge inward (nearest cell first).
function edgeLines(edge, index) {
  if (edge === 'top') return { grid: graph.column(index), cc: cc.column(index) };
  if (edge === 'bottom') {
    return {
      grid: [...graph.column(index)].reverse(),
      cc: [...cc.column(index)].reverse(),
    };
  }
  if (edge === 'left') return { grid: graph.row(index), cc: cc.row(index) };
  if (edge === 'right') {
    return {
      grid: [...graph.row(index)].reverse(),
      cc: [...cc.row(index)].reverse(),
    };
  }
  throw new Error(`unknown edge: ${edge}`);
}

// One outside clue: the sum of the digits from the edge up to and including
// the last cell before the first region border. The border position i
// (1..8, between scan positions i and i+1) is solver-discovered, so this is
// an Or over every feasible i of And(border-is-exactly-here, first i digits
// sum to target); plus one further branch (i=9) for "no border among the
// nine visible cells", i.e. the whole line is one region. `Pair` applies its
// key to every *consecutive* pair in the cell list it is given, so a run of
// shared labels is one Pair call (chain of equalities); the border itself is
// a second Pair call checking the single pair that must differ.
function borderSumClue(target, gridLine, ccLine, label) {
  const branches = [];
  for (let i = 1; i <= 8; i++) {
    const clauses = [];
    if (i >= 2) {
      clauses.push(new Pair(equalKey, `${label}-b${i}-eq`, ...ccLine.slice(0, i)));
    }
    clauses.push(new Pair(notEqualKey, `${label}-b${i}-ne`, ccLine[i - 1], ccLine[i]));
    clauses.push(new Sum(target, ...gridLine.slice(0, i)));
    branches.push(new And(clauses));
  }
  branches.push(new And([
    new Pair(equalKey, `${label}-b9-eq`, ...ccLine),
    new Sum(target, ...gridLine),
  ]));
  return new Or(branches);
}

// Outside clues, transcribed from the puzzle's edge overlays: [edge,
// row-or-column index, printed sum].
const BORDER_CLUES = [
  ['top', 1, 22], ['top', 6, 10], ['top', 9, 26],
  ['bottom', 1, 13], ['bottom', 3, 21], ['bottom', 5, 7], ['bottom', 7, 10], ['bottom', 9, 10],
  ['left', 1, 31], ['left', 4, 5], ['left', 5, 8], ['left', 7, 11], ['left', 9, 9],
  ['right', 1, 11], ['right', 4, 14], ['right', 6, 13], ['right', 9, 17],
];

const borderSums = BORDER_CLUES.map(([edge, index, target]) => {
  const { grid, cc: ccLine } = edgeLines(edge, index);
  return borderSumClue(target, grid, ccLine, `${edge}${index}`);
});

// One corridor arrow: the marked cell's own digit is the corridor length N,
// so this is an Or over every window [start, end] of the arrow's row/column
// (0-based) that contains the marked cell's position `idx`. Each branch
// pins the digit to the window length, chains the window's CC cells equal
// (one Pair call), and -- when a boundary cell exists inside the grid --
// requires it to differ from the window's edge CC cell (a corridor is
// walled by a different region or the grid edge, never left open).
function corridorClue(digitCell, lineCells, ccLine, idx, label) {
  const n = lineCells.length;
  const branches = [];
  for (let start = 0; start <= idx; start++) {
    for (let end = idx; end < n; end++) {
      const len = end - start + 1;
      const clauses = [new Given(digitCell, len)];
      if (len >= 2) {
        clauses.push(new Pair(
          equalKey, `${label}-w${start}-${end}-eq`, ...ccLine.slice(start, end + 1)));
      }
      if (start > 0) {
        clauses.push(new Pair(
          notEqualKey, `${label}-w${start}-${end}-lo`, ccLine[start - 1], ccLine[start]));
      }
      if (end < n - 1) {
        clauses.push(new Pair(
          notEqualKey, `${label}-w${start}-${end}-hi`, ccLine[end], ccLine[end + 1]));
      }
      branches.push(new And(clauses));
    }
  }
  return new Or(branches);
}

// Arrow clue cells, transcribed from the puzzle's drawn arrows (each clue is
// a pair of opposite-direction stub arrowheads from one cell centre): [cell,
// axis].
const ARROW_CLUES = [
  ['R1C3', 'row'], ['R2C6', 'row'], ['R3C5', 'row'], ['R3C9', 'col'],
  ['R4C8', 'row'], ['R5C1', 'col'], ['R5C5', 'col'], ['R6C3', 'row'],
  ['R7C8', 'col'], ['R9C3', 'row'], ['R9C7', 'row'],
];

const corridors = ARROW_CLUES.map(([cell, axis]) => {
  const { row, col } = parseCellId(cell);
  const lineCells = axis === 'row' ? graph.row(row) : graph.column(col);
  const ccLine = axis === 'row' ? cc.row(row) : cc.column(col);
  const idx = (axis === 'row' ? col : row) - 1;
  return corridorClue(cell, lineCells, ccLine, idx, `${cell}-${axis}`);
});

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  noMono2x2,
  ...borderSums,
  ...corridors,
];
