// Title: Next to Nine
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=6YB2c_8I0fU
// Source: https://app.crackingthecryptic.com/sudoku/q9BrpGqTQM

// Normal sudoku rules apply (default row/column/box all-different, 9x9).
// The main diagonal is given (R1C1=1 .. R9C9=9, per the payload's cell
// values).
//
// Clues outside the grid give ALL digits orthogonally adjacent to the 9 in
// that row/column: a left-of-row clue lists the neighbour(s) of the 9 along
// the row (left and/or right); an above-column clue lists the neighbour(s)
// of the 9 along the column (above and/or below). A single-digit clue means
// the 9 sits at a grid edge (only one neighbour exists); a two-digit clue
// means both neighbours are given, in no meaningful order (only two
// neighbours are ever possible, so there is nothing left for an order to
// distinguish). Rows 2, 3, 8 and columns 2, 3, 8 carry no clue and are
// unconstrained by this rule. Coordinates below are transcribed from the
// payload's `overlays` entries (position + text).

const graph = cellGraph('9x9');

// One NFA per clued row/column: scan its 9 cells in order, remember the
// digit immediately before the 9 is seen (or null if the 9 is the first
// cell), then on the next cell compute the full neighbour set and compare
// it against the clue's target set. If the 9 is the last cell scanned,
// there is no "next" cell, so `accept` itself closes out the single-left-
// neighbour case (`phase === 'found'`) using the same comparison.
function nextToNineNfa(targetDigits) {
  const target = [...targetDigits].sort((a, b) => a - b);
  const matchesTarget = (neighbours) => {
    const sorted = [...neighbours].sort((a, b) => a - b);
    return sorted.length === target.length &&
      sorted.every((v, i) => v === target[i]);
  };
  return NFA.encodeSpec({
    startState: { phase: 'scan', prev: null },
    transition: (state, value) => {
      if (state.phase === 'scan') {
        if (value === 9) return { phase: 'found', left: state.prev };
        return { phase: 'scan', prev: value };
      }
      if (state.phase === 'found') {
        const neighbours = state.left !== null ? [state.left, value] : [value];
        return { phase: 'done', match: matchesTarget(neighbours) };
      }
      return state; // phase 'done': verdict already fixed, ignore the rest.
    },
    accept: (state) => {
      if (state.phase === 'done') return state.match;
      // 9 was the last cell scanned: only its left neighbour exists.
      if (state.phase === 'found') {
        return matchesTarget(state.left !== null ? [state.left] : []);
      }
      return false; // unreachable: every row/column contains a 9.
    },
  }, 9);
}

// Row clues: text left of that row (overlays with center [row+0.5, -0.5]).
const rowClues = { 1: [6, 7], 4: [5, 6], 5: [7], 6: [1, 2], 7: [2, 8], 9: [5] };
// Column clues: text above that column (overlays with center [-0.5, col+0.5]).
const colClues = { 1: [4, 8], 4: [1, 8], 5: [3], 6: [4, 5], 7: [6, 8], 9: [6] };

const rowNfas = Object.entries(rowClues).map(([row, digits]) =>
  new NFA(nextToNineNfa(digits), `nextToNine row${row}`, ...graph.row(Number(row))));
const colNfas = Object.entries(colClues).map(([col, digits]) =>
  new NFA(nextToNineNfa(digits), `nextToNine col${col}`, ...graph.column(Number(col))));

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R2C2', 2),
  new Given('R3C3', 3),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R7C7', 7),
  new Given('R8C8', 8),
  new Given('R9C9', 9),
  ...rowNfas,
  ...colNfas,
];
