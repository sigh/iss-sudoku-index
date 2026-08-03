// Title: 7/31/23: First Seen Odd/Even
// Author: clover!
// Video: https://www.youtube.com/watch?v=vsTcSz7HlT0
// Source: https://tinyurl.com/mrycj7jv

// Normal sudoku rules apply. Each outside clue gives the value of the first
// digit of its own parity (odd clue -> first odd digit, even clue -> first
// even digit) encountered scanning that row/column from the clue's side.
// Encoded as one NFA per clue over the row/column ordered from the clue's
// side, with two states: "looking" (loop on any digit of the opposite
// parity to the clue) and "found" (reached only by seeing the clue's own
// value, absorbs the rest of the line). Seeing a same-parity digit other
// than the clue's value while still "looking" is rejected, since that would
// be an earlier same-parity digit than the one the clue names.
const firstOfParity = (v) => NFA.encodeSpec({
  startState: 'looking',
  transition: (state, value) => {
    if (state === 'found') return 'found';
    if (value === v) return 'found';
    return (value % 2 === v % 2) ? undefined : 'looking';
  },
  accept: (state) => state === 'found',
}, 9);

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const colCells = (c) => ALL.map(r => makeCellId(r, c));
const rowCells = (r) => ALL.map(c => makeCellId(r, c));

// Column top-view clues (scan R1->R9), from the text row above the grid:
// R0C1..R0C9 = 1,2,3,4,5,6,7,8,9.
const topClues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// Column bottom-view clues (scan R9->R1), from the text row below the grid:
// R10C1..R10C9 = 8,9,1,2,3,4,5,6,7.
const bottomClues = [8, 9, 1, 2, 3, 4, 5, 6, 7];
// Row left-view clues (scan C1->C9), from text left of the grid:
// R5C0=1, R6C0=2, R7C0=3.
const leftClues = new Map([[5, 1], [6, 2], [7, 3]]);
// Row right-view clues (scan C9->C1), from text right of the grid:
// R3C10=5, R4C10=6, R5C10=7.
const rightClues = new Map([[3, 5], [4, 6], [5, 7]]);

const topNFAs = topClues.map((v, i) =>
  new NFA(firstOfParity(v), `col ${i + 1} top`, colCells(i + 1)));
const bottomNFAs = bottomClues.map((v, i) =>
  new NFA(firstOfParity(v), `col ${i + 1} bottom`, [...colCells(i + 1)].reverse()));
const leftNFAs = [...leftClues].map(([r, v]) =>
  new NFA(firstOfParity(v), `row ${r} left`, rowCells(r)));
const rightNFAs = [...rightClues].map(([r, v]) =>
  new NFA(firstOfParity(v), `row ${r} right`, [...rowCells(r)].reverse()));

// Givens: rows 2 and 8 are fully given, plus four scattered cells in rows
// 4 and 6.
const givens = [
  ['R2C1', 5], ['R2C2', 6], ['R2C3', 7], ['R2C4', 8], ['R2C5', 9],
  ['R2C6', 1], ['R2C7', 2], ['R2C8', 3], ['R2C9', 4],
  ['R4C3', 8], ['R4C6', 6],
  ['R6C4', 2], ['R6C7', 9],
  ['R8C1', 4], ['R8C2', 5], ['R8C3', 6], ['R8C4', 7], ['R8C5', 8],
  ['R8C6', 9], ['R8C7', 1], ['R8C8', 2], ['R8C9', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...topNFAs, ...bottomNFAs, ...leftNFAs, ...rightNFAs,
];
