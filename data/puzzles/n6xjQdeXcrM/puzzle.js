// Title: Ironworks
// Author: BremSter
// Video: https://www.youtube.com/watch?v=n6xjQdeXcrM
// Source: https://app.crackingthecryptic.com/sudoku/rpb2M36q2H

// Normal sudoku, standard 3x3 boxes (the source's own regions are exactly
// the 9 default boxes). No printed givens.
//
// Killer cages: "Digits in cages must sum to the number in the top left
// corner of the cage. Digits cannot repeat within a cage." -- Cage(sum,
// ...cells) bakes in both clauses at once (sum 0/'' means "any sum", i.e.
// all-different only, per ISS's Cage handler).
//
// The source lists 15 real cages. Two have an empty printed total:
//  - the 3-cell cage R6C9/R7C9/R7C8: a lone free-floating text overlay
//    elsewhere in the payload reads "15", centred inside R6C9 (this cage's
//    first cell) right at the top-left-corner spot the source normally uses
//    to render a cage's total. It is the only orphan overlay and this is
//    the only cage missing an inline total, and the small offset (rather
//    than sitting exactly on the corner) keeps the label clear of the
//    neighbouring 78 circle that also touches R6C9 -- so it is read as this
//    cage's total.
//  - the 9-cell cross/plus cage (R3C4-C6, R4-6C5, R7C4-C6): no overlay sits
//    anywhere near it, so it really has no printed total; encoded as
//    Cage('', ...) for all-different only.
//
// Quadruple circles: "Digits in circles must appear at least once in the
// four cells touching that circle" is Quad's own DESCRIPTION verbatim
// ("All the given values must be present in the surrounding 2x2 square").
// Eight circles (2-digit label, each centred on a shared corner of a 2x2
// block). None share a topLeftCell (Quad's UNIQUENESS_KEY_FIELD), so all
// eight survive.

const cages = [
  [15, 'R6C9', 'R7C9', 'R7C8'],
  [11, 'R5C8', 'R5C9'],
  [25, 'R4C8', 'R4C7', 'R5C7', 'R5C6', 'R6C7', 'R6C8'],
  [15, 'R3C8', 'R3C9', 'R4C9'],
  [14, 'R1C8', 'R1C9', 'R2C9'],
  [12, 'R8C9', 'R9C9', 'R9C8'],
  ['', 'R3C4', 'R3C5', 'R3C6', 'R4C5', 'R5C5', 'R6C5', 'R7C4', 'R7C5', 'R7C6'],
  [18, 'R1C4', 'R1C5', 'R1C6', 'R2C5'],
  [21, 'R8C5', 'R9C4', 'R9C6', 'R9C5'],
  [13, 'R9C2', 'R9C1', 'R8C1'],
  [15, 'R6C1', 'R7C1', 'R7C2'],
  [27, 'R6C2', 'R6C3', 'R5C3', 'R5C4', 'R4C3', 'R4C2'],
  [11, 'R5C2', 'R5C1'],
  [15, 'R4C1', 'R3C1', 'R3C2'],
  [12, 'R1C2', 'R1C1', 'R2C1'],
];

const quads = [
  ['R4C1', 7, 8],
  ['R5C8', 7, 8],
  ['R4C8', 5, 6],
  ['R5C1', 5, 6],
  ['R3C4', 1, 2],
  ['R6C5', 1, 3],
  ['R3C5', 2, 3],
  ['R6C4', 2, 3],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...quads.map(([topLeftCell, ...values]) => new Quad(topLeftCell, ...values)),
];
