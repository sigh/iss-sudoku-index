// Title: April 12, 2022:David & Goliath
// Author: clover!
// Video: https://www.youtube.com/watch?v=wwwmflDjNxE
// Source: https://tinyurl.com/2p8fjzrm

// Normal sudoku rules apply. Also, each of the 12 two-cell cages must
// contain one small digit (1-5) and one large digit (5-9); pairs such as
// 2/3 (both small) or 7/9 (both large) are disallowed. Every cage here is
// two cells sharing a row or column, so normal sudoku all-different already
// rules out the same digit twice in a cage -- the only edge case ("5/5",
// where 5 could double as both roles) can't occur.
//
// "one small and one large" over {1..5} x {5..9} is equivalent to: not both
// digits in {1,2,3,4} and not both digits in {6,7,8,9} (checked against all
// nine categories of digit pairing across the small/mid/large split).
const isSmallLarge = Pair.fnToKey(
  (a, b) => !(a <= 4 && b <= 4) && !(a >= 6 && b >= 6),
  9);

const cages = [
  ['R5C2', 'R6C2'],
  ['R2C2', 'R3C2'],
  ['R8C2', 'R8C3'],
  ['R8C5', 'R8C6'],
  ['R7C8', 'R8C8'],
  ['R4C8', 'R5C8'],
  ['R2C7', 'R2C8'],
  ['R2C4', 'R2C5'],
  ['R4C3', 'R5C3'],
  ['R7C4', 'R7C5'],
  ['R5C7', 'R6C7'],
  ['R3C5', 'R3C6'],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 1),
  new Given('R1C5', 2),
  new Given('R2C3', 8),
  new Given('R2C6', 7),
  new Given('R2C9', 6),
  new Given('R3C8', 4),
  new Given('R4C2', 2),
  new Given('R4C4', 9),
  new Given('R4C6', 8),
  new Given('R5C1', 9),
  new Given('R5C5', 5),
  new Given('R5C9', 8),
  new Given('R6C4', 2),
  new Given('R6C6', 1),
  new Given('R6C8', 3),
  new Given('R7C2', 3),
  new Given('R8C1', 7),
  new Given('R8C4', 8),
  new Given('R8C7', 9),
  new Given('R9C5', 3),
  new Given('R9C8', 2),

  ...cages.map(
    ([a, b]) => new Pair(isSmallLarge, 'David & Goliath cage', a, b)),
];
