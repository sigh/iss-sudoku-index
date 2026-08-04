// Title: Butterfly Effect
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=9h9Xsmz7yww
// Source: https://app.crackingthecryptic.com/sudoku/4Fj8prDdbh

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's regions).
// Grey lines with an empty circle at each end (Between): digits strictly
// between the two circles' digits, in path order; the circle cells are the
// line's first/last argument per Between's semantics.
// Purple lines (Renban): digits form a non-repeating consecutive set, any
// order.

// Grey "between" lines. Two (R2C4-R3C3-R4C2 and R2C6-R3C7-R4C8) are drawn as
// a single straight diagonal stroke with no waypoint at the interior cell;
// its centre lies exactly on the segment's midpoint. The other two follow
// drawn bends.
const betweenLines = [
  ['R2C4', 'R3C3', 'R4C2'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R5C4', 'R5C3', 'R6C3', 'R7C3', 'R7C4'],
  ['R5C6', 'R5C7', 'R6C7', 'R7C7', 'R7C6'],
];

// Purple "consecutive set" lines. Two source entries share identical
// way-points (one drawn line duplicated in the source) and are listed once
// here; two further entries carry no way-points and are not drawn lines.
const renbanLines = [
  ['R7C1', 'R8C1', 'R9C1'],
  ['R4C1', 'R5C2', 'R6C2'],
  ['R1C1', 'R1C2', 'R1C3', 'R2C2'],
  ['R2C7', 'R1C7', 'R1C8', 'R1C9'],
  ['R4C7', 'R3C8', 'R2C9', 'R3C9'],
  ['R4C9', 'R5C8', 'R6C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R7C8', 'R8C7'],
  ['R8C6', 'R9C5', 'R8C4'],
  ['R7C2', 'R8C3'],
  ['R6C4', 'R7C5', 'R6C6'],
  ['R3C1', 'R2C1', 'R3C2', 'R4C3'],
];

return [
  new Shape('9x9'),
  new Given('R3C5', 6),
  ...betweenLines.map(cells => new Between(...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
];
