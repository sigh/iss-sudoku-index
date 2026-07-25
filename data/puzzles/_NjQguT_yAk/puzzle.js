// Title: Regional Constraint Rally
// Author: Belamis
// Video: https://www.youtube.com/watch?v=_NjQguT_yAk
// Source: https://sudokupad.app/gavbek5s69

// Normal Sudoku, standard 9 boxes, no givens (Fog of War is solving UI only;
// the revealed/unrevealed state does not change the final grid and is not
// encoded -- see the pipeline's Fog Is Not A Constraint note).
//
// Killer cages, Thermos, Kropki black dots, Dutch/German Whisper lines and a
// Parity line are drawn (Cage/Thermo/BlackDot/Whisper below need no further
// gloss). "Constraint Regions" additionally forbids a repeated digit across
// *all* cells belonging to any instance of the same constraint type -- e.g.
// no digit may appear in more than one Thermo, even across separate
// thermometers and regardless of row/column/box. This is encoded as one
// extra AllDifferent per constraint type, over the union of that type's
// cells, at the end of the script.

// Cage totals/cells: raw `cages` array.
const killerCage1 = ['R9C7', 'R9C8', 'R9C9']; // total 12
const killerCage2 = ['R7C1', 'R7C2', 'R8C2']; // no total
const killerCage3 = ['R5C3', 'R6C2', 'R6C3']; // no total

// Kropki black dots (ratio 1:2): raw `overlays`, small black-filled
// white-outlined edge marks.
const kropkiDots = [
  ['R4C7', 'R5C7'],
  ['R7C9', 'R8C9'],
  ['R8C1', 'R8C2'],
];

// Thermometers: raw `lines` (grey, double-thickness stroke) give the path;
// raw `underlays` (matching grey filled circles) give the bulb cell, which
// is not always a line's first waypoint -- the last thermo's bulb sits at
// its line's second cell, reversing the increasing direction.
const thermos = [
  ['R2C1', 'R3C1', 'R3C2'],
  ['R2C7', 'R3C6'],
  ['R1C3', 'R2C3'],
  ['R2C6', 'R1C6'], // bulb R2C6 per underlay; drawn line order is R1C6-R2C6
];

// Dutch Whisper lines (orange, difference >= 4): raw `lines`.
const dutchWhispers = [
  ['R9C2', 'R9C3', 'R8C3'],
  ['R4C2', 'R4C1', 'R5C1', 'R6C1'],
  ['R3C8', 'R3C9'],
];

// German Whisper lines (green, difference >= 5): raw `lines`.
const germanWhispers = [
  ['R7C7', 'R8C7', 'R8C8'],
  ['R6C8', 'R6C9'],
];

// Parity line (red): raw `lines`. Encoded with a custom Pair applied along
// the ordered path, since ISS has no dedicated alternating-parity line class.
const parityLine = ['R7C5', 'R8C5', 'R9C5'];
const differentParity = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

return [
  new Shape('9x9'),

  new Cage(12, ...killerCage1),
  new AllDifferent(...killerCage2),
  new AllDifferent(...killerCage3),

  ...kropkiDots.map(cells => new BlackDot(...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...dutchWhispers.map(cells => new Whisper(4, ...cells)),
  ...germanWhispers.map(cells => new Whisper(5, ...cells)),
  new Pair(differentParity, 'parity', ...parityLine),

  // Constraint Regions: one cross-instance AllDifferent per constraint type,
  // over the union of that type's cells.
  new AllDifferent(...[killerCage1, killerCage2, killerCage3].flat()),
  new AllDifferent(...kropkiDots.flat()),
  new AllDifferent(...thermos.flat()),
  new AllDifferent(...dutchWhispers.flat()),
  new AllDifferent(...germanWhispers.flat()),
  // Parity has only one line, so this is implied by the line's own column
  // (R7C5/R8C5/R9C5 are all C5) -- kept for literal rule coverage.
  new AllDifferent(...parityLine),
];
