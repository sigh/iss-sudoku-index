// Title: Unique Under the Fog 5.0
// Author: Visumation
// Video: https://www.youtube.com/watch?v=DKPhTQoygdY
// Source: https://sudokupad.app/3dnyh2rdg2

// Standard 9x9 sudoku (rows, columns, boxes), no givens, plus:
//  - Arrows: digits on the arrow sum to the circle's digit.
//  - German Whisper (GW) lines: adjacent digits differ by >= 5.
//  - Renban (RB) lines: non-repeating set of consecutive digits.
//  - Ten-lines (T): each line sums to 10 (segmentation collapses to the
//    whole line -- see the Ten-lines section below).
//  - Black dots: the two digits are in a 1:2 ratio.
//  - Each of the five constraint types above (arrows, GW, RB, T, dots) may
//    contain no repeated digit anywhere in the puzzle -- not just within one
//    instance of the type, but across every instance of it. Encoded below as
//    one extra AllDifferent per type, over the union of that type's cells.
//  - No repeats on either main diagonal.
//  - No repeats among the nine "blue square" cells.
//  - The two "grey circle" cells hold odd digits.
// Fog (foglight/triggereffect in the payload) is solving UI only and is not
// part of the final-grid rules, so it is not encoded.

const arrow1 = ['R6C5', 'R5C4', 'R4C5', 'R5C6']; // circle first, then bulb path (source: arrows[0])
const arrow2 = ['R6C5', 'R6C6', 'R6C7']; // circle first, then straight path (source: arrows[1])

const gwLines = [
  ['R1C1', 'R2C2'],
  ['R8C8', 'R9C9'],
  ['R4C1', 'R4C2'],
]; // source: lines[] coloured #bbee9f (lightgreen), labelled "GW"

const rbLines = [
  ['R8C2', 'R9C1'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R7C2', 'R7C3', 'R8C3'],
]; // source: lines[] coloured #fbc9f3 (thistle), labelled "RB"

// Every grey line is 2 or 3 cells long. A segment can never be a single
// cell (the max digit is 9 < 10), so the only valid segmentation of a 2- or
// 3-cell line is the whole line as one segment: each line simply sums to 10.
const tLines = [
  ['R9C4', 'R9C5', 'R9C6'],
  ['R5C7', 'R5C8'],
  ['R2C4', 'R3C4'],
]; // source: lines[] coloured #d2d2d2 (lightgray), labelled "T"

const dots = [
  ['R2C6', 'R3C6'],
  ['R1C6', 'R1C7'],
]; // source: overlays[] edge-centred black dots (fill #000000)

const blueSquareCells = [
  'R9C1', 'R8C2', 'R7C3', 'R3C3', 'R3C7', 'R2C8', 'R1C9', 'R7C7', 'R5C5',
]; // source: underlays[] backgroundColor #c6f6fd (powderblue) squares

const greyCircleCells = ['R1C1', 'R9C9']; // source: underlays[] rounded, backgroundColor #0003

return [
  new Shape('9x9'),

  new Diagonal(1), // positive, SW-NE
  new Diagonal(-1), // negative, NW-SE

  new AllDifferent(...blueSquareCells),

  ...greyCircleCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),

  new Arrow(...arrow1),
  new Arrow(...arrow2),
  new AllDifferent(...arrow1.slice(1), ...arrow2.slice(1)), // type-wide no-repeat, arm cells only (excludes the shared circle)

  ...gwLines.map((cells) => new Whisper(5, ...cells)),
  new AllDifferent(...gwLines.flat()), // type-wide no-repeat across all GW lines

  ...rbLines.map((cells) => new Renban(...cells)),
  new AllDifferent(...rbLines.flat()), // type-wide no-repeat across all RB lines

  ...tLines.map((cells) => new Sum(10, ...cells)),
  new AllDifferent(...tLines.flat()), // type-wide no-repeat across all T lines (also forces each line's digits distinct)

  ...dots.map((cells) => new BlackDot(...cells)),
  new AllDifferent(...dots.flat()), // type-wide no-repeat across both dots
];
