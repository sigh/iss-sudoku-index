// Title: Oct 11, 2021: Max Odd/Even Run
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=B1GJadtsIRg
// Source: https://tinyurl.com/3f7dc45z

// Normal sudoku rules. A number outside a row or column gives the length of
// the longest run of orthogonally-adjacent cells in that row/column which
// share parity (all odd, or all even). Rows 2, 5, 8 and columns 4, 5, 6 are
// clued (outside-clue text at R2C0=1, R5C0=2, R8C0=5, R0C4=4, R0C5=3,
// R0C6=4); every other row/column is unclued and left unconstrained.

const rowClues = { 2: 1, 5: 2, 8: 5 };
const colClues = { 4: 4, 5: 3, 6: 4 };

// One NFA per clue: scan the 9-cell line tracking the current same-parity
// run length and the maximum run length seen so far, and accept only when
// that maximum equals the printed clue.
const maxParityRunNFA = (target) => NFA.encodeSpec({
  startState: { parity: null, runLen: 0, maxLen: 0 },
  transition: ({ parity, runLen, maxLen }, value) => {
    const p = value % 2;
    // Clamp at 9: no line has more than 9 cells, so runLen/maxLen can never
    // legitimately exceed it, but nothing else bounds the compiler's search.
    const newRunLen = Math.min(p === parity ? runLen + 1 : 1, 9);
    return { parity: p, runLen: newRunLen, maxLen: Math.min(Math.max(maxLen, newRunLen), 9) };
  },
  accept: ({ maxLen }) => maxLen === target,
  maxDepth: 9,
}, 9);

const rowCells = (row) => Array.from({ length: 9 }, (_, i) => makeCellId(Number(row), i + 1));
const colCells = (col) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, Number(col)));

return [
  ...Object.entries(rowClues).map(([row, target]) => (
    new NFA(maxParityRunNFA(target), `row ${row} max parity run = ${target}`, ...rowCells(row))
  )),
  ...Object.entries(colClues).map(([col, target]) => (
    new NFA(maxParityRunNFA(target), `col ${col} max parity run = ${target}`, ...colCells(col))
  )),
  new Given('R1C2', 6), new Given('R1C8', 8),
  new Given('R2C1', 5), new Given('R2C9', 7),
  new Given('R3C4', 1), new Given('R3C6', 2),
  new Given('R4C3', 1), new Given('R4C7', 2),
  new Given('R6C3', 4), new Given('R6C7', 3),
  new Given('R7C4', 4), new Given('R7C6', 3),
  new Given('R8C1', 6), new Given('R8C9', 9),
  new Given('R9C2', 8), new Given('R9C8', 7),
];
