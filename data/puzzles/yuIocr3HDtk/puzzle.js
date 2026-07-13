// Title: Mayan Ruins
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=yuIocr3HDtk
// Source: https://sudokupad.app/wnw8v9wxre

// Normal sudoku rules apply. Any sequence of five cells along the long
// purple lines must contain a run of five consecutive digits in any order
// without repeats. Lines shorter than five cells must contain a run of
// consecutive digits in any order without repeats.
//
// The four long lines each run through 9 cells (all columns of a 3-row
// band, zigzagging between the band's rows). Every window of 5
// consecutive cells along each long line is encoded as its own Renban
// (consecutive, non-repeating, any order), matching the "any sequence of
// five cells along the line" wording.
//
// The four short lines (under 5 cells) are each encoded as a single
// Renban over their full cell set. One short line's raw source data is a
// closed 4-cell loop drawn as two overlapping polylines through the same
// cells (R9C6-R8C5-R9C4-R9C5); since a short line's rule only concerns
// the set of cells, not the traversal order, it is encoded as one Renban
// over those 4 cells.

const longLines = [
  ['R7C1', 'R6C2', 'R7C3', 'R6C4', 'R5C5', 'R6C6', 'R7C7', 'R6C8', 'R7C9'],
  ['R9C9', 'R8C8', 'R9C7', 'R8C6', 'R7C5', 'R8C4', 'R9C3', 'R8C2', 'R9C1'],
  ['R3C1', 'R4C2', 'R5C3', 'R4C4', 'R3C5', 'R4C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R1C1', 'R2C2', 'R3C3', 'R2C4', 'R1C5', 'R2C6', 'R3C7', 'R2C8', 'R1C9'],
];

const shortLines = [
  ['R3C4', 'R2C5', 'R3C6'],
  ['R5C1', 'R5C2', 'R6C3'],
  ['R5C9', 'R5C8', 'R6C7'],
  ['R9C6', 'R8C5', 'R9C4', 'R9C5'],
];

const longRenbans = longLines.flatMap(line =>
  Array.from({length: line.length - 4}, (_, i) =>
    new Renban(...line.slice(i, i + 5))
  )
);

const shortRenbans = shortLines.map(line => new Renban(...line));

return [
  new Shape('9x9'),
  new Given('R4C3', 6),
  new Given('R4C5', 1),
  new Given('R4C7', 9),
  new Given('R6C1', 1),
  new Given('R6C9', 7),
  ...longRenbans,
  ...shortRenbans,
];
