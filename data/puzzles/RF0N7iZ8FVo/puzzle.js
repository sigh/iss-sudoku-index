// Title: Kropki X-Sums
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=RF0N7iZ8FVo
// Source: https://app.crackingthecryptic.com/sudoku/hLFhRQp4gd

// Normal sudoku rules (default row/column/box all-different from Shape('9x9')
// on the standard 3x3 regions -- the source's own region list is exactly the
// default 9 boxes).
//
// Kropki dots: white separates two consecutive digits, black separates two
// digits with a 1:2 ratio. "Not all dots are given," so no negative
// constraint is added for undrawn edges. Only 3 of the source's 13 dot
// overlays sit on a real interior edge between two grid cells; those 3 are
// encoded below. The remaining 10 sit outside the grid border and are
// Kropki-style relations among the puzzle's outside X-sum totals, none of
// which is printed anywhere in the source -- omitted (unsupported: no ISS
// primitive materializes an unbounded, un-printed outside-clue total).
const dots = [
  new WhiteDot('R3C1', 'R4C1'),
  new WhiteDot('R4C7', 'R5C7'),
  new BlackDot('R8C1', 'R9C1'),
];

return [
  new Shape('9x9'),
  ...dots,
];
