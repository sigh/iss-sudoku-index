// Title: Unknown
// Author: Prowling Tiger
// Video: https://www.youtube.com/watch?v=sf78MKJvUOM
// Source: https://cracking-the-cryptic.web.app/sudoku/T7bPh967rT

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Numbers outside the grid are Sandwich clues: the sum of the digits between
// the 1 and the 9 in that row or column. A slash between values means the sum
// is either one ("5/10" -> 5 or 10). The single off-grid arrow drawn at the
// R9C1 corner, running up-right across the whole board, marks the main
// anti-diagonal (R9C1..R1C9): its 9 digits sum to 39. R5C4 must hold the
// digit equal to "x+1", where x is an unknown integer that several outside
// Sandwich clues are also drawn in terms of (plain "x", "x+1", "N-x", or a
// slash list mixing literals with x/2x); x is not itself a grid digit.
//
// Each outside clue below is a single drawn label, except the multi-glyph
// ones spelled out beside row 1 ("x","+","1" -> "x+1"), row 5
// ("2x/","35","-","x" -> "2x/35-x"), column 1 ("35","-","x" -> "35-x"),
// column 3 (same three glyphs -> "35-x"), column 7 ("34","-","x" -> "34-x")
// and column 9 ("33","-","x" -> "33-x"), each read in the direction that
// glyph-by-glyph reproduces the in-grid "x+1" clue's own reading order.
// Row 6 and columns 2, 5, 8 carry no outside clue at all.
//
// x is modeled here as the shared unknown fixed by R5C4's own digit v
// (x = v - 1): one branch per v = 1..9, each pinning R5C4 = v and every
// x-dependent Sandwich clue to its value at that x, ORed together since
// exactly one v is the true one.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const row = n => graph.rows()[n - 1];
const col = n => graph.columns()[n - 1];
const sandwichRow = (n, value) => Sandwich.fromCells(value, row(n), geometry);
const sandwichCol = (n, value) => Sandwich.fromCells(value, col(n), geometry);

// Main anti-diagonal: R9C1, R8C2, ..., R1C9.
const diagonal = [];
for (let i = 1; i <= 9; i++) {
  diagonal.push(makeCellId(10 - i, i));
}

const xBranches = [];
for (let v = 1; v <= 9; v++) {
  const x = v - 1;
  xBranches.push(new And([
    new Given('R5C4', v),
    sandwichRow(1, x + 1), // "x+1"
    sandwichRow(2, x),     // "x"
    sandwichRow(3, x),     // "x"
    new Or([                // "0/2/x/2x"
      sandwichRow(4, 0),
      sandwichRow(4, 2),
      sandwichRow(4, x),
      sandwichRow(4, 2 * x),
    ]),
    new Or([                // "2x/35-x"
      sandwichRow(5, 2 * x),
      sandwichRow(5, 35 - x),
    ]),
    sandwichRow(7, x),     // "x"
    sandwichRow(8, x),     // "x"
    sandwichRow(9, x),     // "x"
    sandwichCol(1, 35 - x), // "35-x"
    sandwichCol(3, 35 - x), // "35-x"
    sandwichCol(7, 34 - x), // "34-x"
    sandwichCol(9, 33 - x), // "33-x"
  ]));
}

return [
  new Shape('9x9'),
  new Given('R4C3', 5),
  new Given('R4C6', 1),
  new Sum(39, ...diagonal),
  sandwichCol(4, 0),
  sandwichCol(6, 8),
  new Or(xBranches),
];
