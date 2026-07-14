// Title: Mosaic
// Author: zetamath and friends
// Video: https://www.youtube.com/watch?v=KPSPD-fl8ew
// Source: https://sudokupad.app/h2sdbmic8x

// Normal sudoku rules apply, standard 3x3 boxes, no given digits.
//
// GW (German Whispers): adjacent digits on the line differ by at least 5.
//   Drawn as two branching segments per side (a straight run plus a 2-cell
//   spur meeting it mid-line); each drawn segment is its own Whisper so the
//   spur's pair is enforced without implying an order through the branch
//   point.
// DW (Dutch Whispers): adjacent digits on the line differ by at least 4.
// Parity line ("Par"/"PR" in the source): digits along the line strictly
//   alternate odd/even.
// Nabner ("Nab"): no two digits on the line are consecutive, regardless of
//   their position on the line -- i.e. every pair on the line, not just
//   line-adjacent pairs.
// Ten Line ("Ten", grey): the line's digits partition into one or more
//   contiguous, non-overlapping groups that each sum to exactly 10;
//   digits may repeat within a group where otherwise allowed.
// Entropic ("Ent"): every 3 sequential cells on the line contain one low
//   (1-3), one mid (4-6), and one high (7-9) digit.
// Kropki dots: a black dot means one digit is double the other; a white
//   dot means the two digits are consecutive. Not all such dots are given,
//   so no negative inference applies to undotted adjacent cells.

const germanWhispers = [
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
  ['R6C1', 'R6C2'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R7C9', 'R7C8'],
].map(cells => new Whisper(5, ...cells));

const dutchWhispers = [
  new Whisper(4, 'R3C5', 'R3C4', 'R4C4', 'R5C4', 'R5C3', 'R4C2'),
];

// Parity line: strictly alternating odd/even, either polarity, across all
// 6 cells.
const parityLine = [
  new Regex(
    '([13579][2468]){3}|([2468][13579]){3}',
    'R5C5', 'R5C6', 'R4C6', 'R3C6', 'R3C7', 'R4C8'),
];

// Nabner: no two cells anywhere on the line may hold consecutive digits.
// PairX applies the relation to every pair in the given cell set (not just
// line-adjacent pairs), matching "regardless of their position on the line".
const nonConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const nabnerLines = [
  ['R8C3', 'R8C2', 'R9C2'],
  ['R8C7', 'R8C8', 'R9C8'],
].map(cells => new PairX(nonConsecutiveKey, 'Nabner', ...cells));

// Ten Line: partitions into contiguous groups summing to 10.
const tenLines = [
  new SumLine(10, 'R8C4', 'R7C4', 'R6C4', 'R6C5', 'R6C6', 'R7C6', 'R8C6'),
];

const entropicLines = [
  new Entropic('R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Entropic('R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
];

const dots = [
  new BlackDot('R2C5', 'R3C5'),
  new WhiteDot('R7C5', 'R8C5'),
];

return [
  new Shape('9x9'),

  ...germanWhispers,
  ...dutchWhispers,
  ...parityLine,
  ...nabnerLines,
  ...tenLines,
  ...entropicLines,
  ...dots,
];
