// Title: Unique Under the Fog 4.0
// Author: Visumation
// Video: https://www.youtube.com/watch?v=Z4mpkfkhXOU
// Source: https://sudokupad.app/sq3rfco0oe

// Standard 9x9 sudoku (rows, columns, boxes), givens R2C2=6, R9C4=6, plus:
//  - German Whisper (GW) lines: adjacent digits differ by >= 5.
//  - Dutch Whisper (DW) lines: adjacent digits differ by >= 4.
//  - Arrows: digits on the arrow (arm cells) sum to the circle's digit.
//  - Zipper (Z) line: pairs equidistant from the centre share a sum; this
//    line has even length, so there is no single centre-digit case.
//  - Cages: distinct digits, summing to the printed total.
//  - Each of the five lettered types above (GW, DW, Arrow, Z, Cage) may
//    contain no repeated digit anywhere in the puzzle -- not just within
//    one instance, but across every instance of that type. Encoded below
//    as one extra AllDifferent per type over the union of that type's
//    cells (arrow circles excluded: rule C names "digits on an arrow",
//    i.e. the arm, as sharing this restriction -- the circle just holds
//    the sum). The Zipper type has only one drawn instance, so its
//    type-wide AllDifferent applies within that single line.
//
// The fog/reveal mechanic is solving UI only, not a final-grid rule; not
// encoded.

const gwLines = [
  ['R9C8', 'R9C9', 'R8C9'],
  ['R1C2', 'R1C1', 'R2C1', 'R3C1'],
]; // source: lines[] coloured #bbee9f (lightgreen), labelled "GW"

const dwLines = [
  ['R1C7', 'R2C7'],
  ['R2C2', 'R3C2'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R5C4', 'R6C4'],
]; // source: lines[] coloured #fbd69a (navajowhite), labelled "DW"

const zipperLine = [
  'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3',
]; // source: lines[] coloured #d6c5f3 (thistle), labelled "Z"

// Circle first, then arm cells (source: arrows[], overlay circles at R9C1/R1C9).
const arrow1 = ['R9C1', 'R9C2', 'R9C3'];
const arrow2 = ['R1C9', 'R2C9', 'R3C9', 'R4C9'];
const arrowArmCells = [...arrow1.slice(1), ...arrow2.slice(1)];

// [cells, total] pairs; source: cages[], all four flagged "unique".
const cages = [
  [['R5C1', 'R6C1'], 11],
  [['R1C5', 'R1C6'], 11],
  [['R5C9', 'R6C9'], 11],
  [['R3C2', 'R4C2'], 11],
];
const cageCells = cages.flatMap(([cells]) => cells);

return [
  new Shape('9x9'),

  new Given('R2C2', 6),
  new Given('R9C4', 6),

  ...gwLines.map(cells => new Whisper(5, ...cells)),
  new AllDifferent(...gwLines.flat()), // type-wide no-repeat across both GW lines

  ...dwLines.map(cells => new Whisper(4, ...cells)),
  new AllDifferent(...dwLines.flat()), // type-wide no-repeat across all four DW lines

  new Zipper(...zipperLine),
  new AllDifferent(...zipperLine), // type-wide no-repeat; only one Z line, so this applies within it

  new Arrow(...arrow1),
  new Arrow(...arrow2),
  new AllDifferent(...arrowArmCells), // type-wide no-repeat, arm cells only (excludes both circles)

  ...cages.map(([cells, total]) => new Cage(total, ...cells)),
  new AllDifferent(...cageCells), // type-wide no-repeat across all four cages
];
