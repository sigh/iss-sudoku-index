// Title: Zip of the Iceberg
// Author: gdc
// Video: https://www.youtube.com/watch?v=za-aWWwgU7Q
// Source: https://app.crackingthecryptic.com/814oz1tj0e

// Normal Sudoku applies. Every pair of cells related by a 180-degree rotation
// sums to 10; the central cell is consequently 5. Lavender paths are zipper
// lines, and adjacent cells on each green path differ by at least 5. Fog is
// UI-only, while the stated size, orthogonality, and disjointness of the drawn
// lines describe their fixed geometry rather than further digit constraints.

const lavenderZippers = [
  ['R3C5', 'R4C5', 'R5C5', 'R5C4', 'R5C3'],
  ['R3C2', 'R3C3', 'R3C4', 'R4C4', 'R4C3'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C4'],
  ['R4C7', 'R5C7', 'R5C8', 'R6C8', 'R7C8'],
  ['R1C4', 'R1C5', 'R2C5', 'R2C4', 'R2C3'],
];

const greenWhispers = [
  ['R1C7', 'R2C7', 'R2C8', 'R2C9', 'R3C9'],
  ['R3C6', 'R4C6', 'R5C6', 'R6C6', 'R6C7'],
  ['R9C5', 'R8C5', 'R7C5', 'R7C6', 'R7C7'],
  ['R9C1', 'R8C1', 'R8C2', 'R8C3', 'R9C3'],
];

// The rule's 180-degree rotation pairs each cell in the top four rows with its
// turned counterpart in the bottom four rows; makeCellId keeps that geometry
// row/column based rather than hand-transcribing 36 pairs.
const rotatedPairs = Array.from({ length: 4 }, (_, rowIndex) =>
  Array.from({ length: 9 }, (_, colIndex) => {
    const row = rowIndex + 1;
    const col = colIndex + 1;
    return [makeCellId(row, col), makeCellId(10 - row, 10 - col)];
  }),
).flat();
const sumToTen = Pair.fnToKey((a, b) => a + b === 10, 9);

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...rotatedPairs.map(([a, b]) => new Pair(sumToTen, 'rotational sum 10', a, b)),
  ...lavenderZippers.map((cells) => new Zipper(...cells)),
  ...greenWhispers.map((cells) => new Whisper(5, ...cells)),
];
