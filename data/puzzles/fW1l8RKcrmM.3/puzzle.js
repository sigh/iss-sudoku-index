// Title: April 25, 2023:New Math Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=fW1l8RKcrmM
// Source: https://tinyurl.com/2sbb59yh

// Normal sudoku rules apply. A clue to the left/right of a row is the sum of
// the two digits in that row nearest the clue (columns 1-2 for a left clue,
// columns 9-8 for a right clue); a clue above/below a column is the product
// of the two digits in that column nearest the clue (rows 1-2 for an above
// clue, rows 9-8 for a below clue). Each clue relates exactly those two
// cells -- no clue reaches further into the row/column.

// Row clue totals, transcribed from the drawn text overlays outside each row.
const rowSums = [
  ['R1C1', 'R1C2', 6],   // Row 1, left
  ['R1C9', 'R1C8', 14],  // Row 1, right
  ['R2C9', 'R2C8', 14],  // Row 2, right
  ['R3C1', 'R3C2', 6],   // Row 3, left
  ['R4C1', 'R4C2', 13],  // Row 4, left
  ['R4C9', 'R4C8', 4],   // Row 4, right
  ['R6C1', 'R6C2', 3],   // Row 6, left
  ['R6C9', 'R6C8', 11],  // Row 6, right
  ['R7C9', 'R7C8', 6],   // Row 7, right
  ['R8C1', 'R8C2', 15],  // Row 8, left
  ['R9C1', 'R9C2', 15],  // Row 9, left
  ['R9C9', 'R9C8', 6],   // Row 9, right
].map(([a, b, sum]) => new Sum(sum, a, b));

// No built-in class multiplies two cells, so the product clues use a custom
// Pair relation (catalog: "For a custom relation use Pair.fnToKey"): the key
// encodes the truth table "a * b === product" over digits 1-9.
const productKey = (product) => Pair.fnToKey((a, b) => a * b === product, 9);

// Column clue totals, transcribed from the same overlays.
const colProducts = [
  ['R1C1', 'R2C1', 18],  // Col 1, above
  ['R1C3', 'R2C3', 18],  // Col 3, above
  ['R9C4', 'R8C4', 15],  // Col 4, below
  ['R1C6', 'R2C6', 14],  // Col 6, above
  ['R9C7', 'R8C7', 24],  // Col 7, below
  ['R9C9', 'R8C9', 24],  // Col 9, below
].map(([a, b, product]) =>
  new Pair(productKey(product), `Product clue ${product}`, a, b));

return [
  new Shape('9x9'),
  ...rowSums,
  ...colProducts,
];
