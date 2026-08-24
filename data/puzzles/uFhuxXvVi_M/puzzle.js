// Title: SandwichScrapers
// Author: cfop
// Video: https://www.youtube.com/watch?v=uFhuxXvVi_M
// Source: https://app.crackingthecryptic.com/sudoku/9L9h4P4BFP
//
// Normal sudoku rules apply. Every row and column carries a Skyscraper
// visible-building count on both ends (36 clues total, transcribed from the
// payload's outside-clue overlays below).
//
// A second rule has no printed clue at all: "Sandwich clues are not given,
// but would show the sums of digits between 1 and 9, and would increase by 1
// in every row going down the grid." So each row r has an (unprinted)
// 1-9 sandwich sum S(r), and S(r+1) = S(r) + 1 for r = 1..8. The anchor
// S(1) is unknown, so this is encoded as an existential: try every anchor
// value s for which all nine sums S(1)=s .. S(9)=s+8 stay in the valid
// Sandwich range [0, 35], and require the row sums to equal that particular
// arithmetic run for at least one such s. 0 <= s <= 27 is the full valid
// range (S(9) = s+8 <= 35).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Skyscraper clue values, transcribed from the payload's outside-clue
// overlays, indexed C1..C9 / R1..R9.
const top = [2, 3, 3, 1, 5, 2, 3, 5, 3];
const bottom = [2, 3, 1, 3, 2, 4, 4, 2, 4];
const left = [4, 1, 3, 3, 6, 2, 5, 4, 2];
const right = [4, 2, 3, 2, 1, 4, 2, 3, 3];

// Build each Skyscraper from its line of cells (top/left read the column or
// row forward, bottom/right read it reversed) so the canonical direction
// comes from the cell order rather than a hand-built arrowId.
const skyscrapers = [];
for (let i = 1; i <= 9; i++) {
  skyscrapers.push(Skyscraper.fromCells(top[i - 1], graph.column(i), geometry));
  skyscrapers.push(Skyscraper.fromCells(
    bottom[i - 1], [...graph.column(i)].reverse(), geometry));
  skyscrapers.push(Skyscraper.fromCells(left[i - 1], graph.row(i), geometry));
  skyscrapers.push(Skyscraper.fromCells(
    right[i - 1], [...graph.row(i)].reverse(), geometry));
}

// Existential over the unprinted row-1 sandwich sum s: for each candidate s,
// require every row's 1-9 sandwich sum to equal s + (row - 1) via the native
// Sandwich outside clue (a sandwich sum is order-independent, so the row's
// forward cell order works for either printed direction).
const sandwichAnchors = [];
for (let s = 0; s <= 27; s++) {
  const rowSums = [];
  for (let r = 1; r <= 9; r++) {
    rowSums.push(Sandwich.fromCells(s + (r - 1), graph.row(r), geometry));
  }
  sandwichAnchors.push(new And(rowSums));
}

return [
  new Shape('9x9'),
  ...skyscrapers,
  new Or(sandwichAnchors),
];
