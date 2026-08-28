// Title: Pyramid Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=j4Tz1rHWCOg
// Source: https://tinyurl.com/3a3r84w8
//
// Normal Sudoku rules apply (default rows/columns/3x3 boxes). If a grey cell
// has two grey cells immediately diagonally beneath it, then the number in
// the top cell must be the difference of the numbers in the bottom two
// cells.
//
// Nine grey cells have both diagonal-below neighbours also grey; each such
// triple [top, bottomLeft, bottomRight] is encoded as
// top == |bottomLeft - bottomRight|, i.e. top plus whichever bottom cell is
// smaller equals the other bottom cell -- an Or over the two orderings, each
// an EqualSum between the {top, one bottom cell} segment and the
// {other bottom cell} segment.

function pyramidDiff(top, bottomLeft, bottomRight) {
  return new Or([
    new EqualSum([top, bottomRight], [bottomLeft]),
    new EqualSum([top, bottomLeft], [bottomRight]),
  ]);
}

// Provenance: coordinates of grey cells transcribed from the shaded-cell
// colour marker in the puzzle payload; the nine triples are every grey cell
// whose two diagonal-below neighbours are both also grey.
const triples = [
  ['R1C5', 'R2C4', 'R2C6'],
  ['R4C2', 'R5C1', 'R5C3'],
  ['R4C8', 'R5C7', 'R5C9'],
  ['R6C5', 'R7C4', 'R7C6'],
  ['R7C4', 'R8C3', 'R8C5'],
  ['R7C6', 'R8C5', 'R8C7'],
  ['R8C3', 'R9C2', 'R9C4'],
  ['R8C5', 'R9C4', 'R9C6'],
  ['R8C7', 'R9C6', 'R9C8'],
];

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle payload's given cells.
  new Given('R2C1', 8), new Given('R2C2', 1),
  new Given('R2C8', 2), new Given('R2C9', 5),
  new Given('R4C1', 9), new Given('R4C3', 1), new Given('R4C4', 2),
  new Given('R4C5', 3), new Given('R4C6', 4), new Given('R4C7', 5),
  new Given('R4C9', 7),
  new Given('R8C1', 1), new Given('R8C2', 7), new Given('R8C4', 6),
  new Given('R8C6', 9), new Given('R8C8', 5), new Given('R8C9', 8),

  ...triples.map(t => pyramidDiff(...t)),
];
