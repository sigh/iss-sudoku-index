// Title: Robin Hood's Sudoku
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=pdtWTg4LrqQ
// Source: https://cracking-the-cryptic.web.app/sudoku/h27LtR9RnN

// The source publishes no rules text at all. Every rule below is read from
// the drawn geometry under this pipeline's established default conventions:
//   - Normal sudoku on the standard 3x3 boxes. No given digits.
//   - Nine thermometers, drawn as ten grey (#CFCFCF) line entries; two of
//     them share bulb cell R5C8 and continue as the two arms of one bent
//     figure (confirmed by the geometry helper's connected-stroke-union
//     read: one continuous 8-edge path R1C5-...-R5C8-...-R9C5), so each arm
//     is encoded as its own Thermo from the shared bulb.
//   - Two arrows (of the three drawn): the sum along the arrow equals the
//     digit in its circled bulb. Both encoded arrows are anchored by an
//     explicit bulb-circle overlay and have a short, arithmetically
//     possible sum path.
// Omitted:
//   - The third drawn arrow (a near-horizontal stroke spanning most of row
//     5): every reading of it as a standard sum arrow needs >= 7 same-row
//     cells on the sum side, which the row's own all-different rule makes
//     arithmetically impossible for any single-digit bulb. Its bulb cell
//     is also not decidable (its start waypoint sits exactly on the
//     R5C2/R5C3 border, with no bulb-circle overlay to break the tie).
//   - The unlabelled white/black rounded-rectangle domino mark spanning
//     R5C1-R5C2: nothing local states what relationship it asserts.

const thermos = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R2C9', 'R1C9', 'R1C8'],
  ['R5C8', 'R4C8', 'R3C7', 'R2C6', 'R1C5'],
  ['R5C8', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R7C8', 'R6C9'],
  ['R4C9', 'R3C8'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ['R5C5', 'R5C4', 'R5C3'],
];

const arrows = [
  ['R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R6C2', 'R7C3', 'R8C4', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
