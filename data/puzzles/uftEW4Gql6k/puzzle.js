// Title: Little Killer Thermo
// Author: Kurt Hugo Schneider
// Video: https://www.youtube.com/watch?v=uftEW4Gql6k
// Source: https://app.crackingthecryptic.com/webapp/N9QqMTQ6fL

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Digits along a thermometer
// increase from the bulb end. Each outside diagonal clue gives the sum of
// the digits along its indicated diagonal; repeats are allowed except where
// normal sudoku (row/column/box) all-different already applies to a stretch
// of the diagonal.

const geometry = cellGeometry(9);

// 7 thermometers, bulb cell first, transcribed from the drawn gray lines and
// their filled-circle bulbs. Three of them (3a/3b/3c) share bulb R5C5 -- a
// single branching thermometer with three independent increasing arms out of
// one shared cell. 4 and 5 are mirror zigzags that dip from the center box
// into a neighbour box and back.
const thermos = [
  ['R3C1', 'R4C2'],
  ['R7C9', 'R6C8'],
  ['R5C5', 'R6C5', 'R7C5'],
  ['R5C5', 'R5C6'],
  ['R5C5', 'R5C4'],
  ['R6C4', 'R6C3', 'R5C3', 'R4C3', 'R4C4'],
  ['R6C6', 'R6C7', 'R5C7', 'R4C7', 'R4C6'],
].map(cells => new Thermo(...cells));

// 6 outside diagonal-sum clues. LittleKiller.fromCells derives the canonical
// corner/direction from the explicit cell list, so the drawn corner and ray
// direction need not be hand-mapped to ISS's own arrowId convention.
const littleKillers = [
  [44, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [47, ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9']],
  [57, ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']],
  [46, ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1']],
  [54, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
  [47, ['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...thermos,
  ...littleKillers,
];
