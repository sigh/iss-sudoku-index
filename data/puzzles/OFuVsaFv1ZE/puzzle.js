// Title: FUll Rankillers
// Author: Las4one
// Video: https://www.youtube.com/watch?v=OFuVsaFv1ZE
// Source: https://sudokupad.app/kh62gdjsgt

// Normal sudoku rules apply within the central 9x9 area: Shape('9x9') gives
// the default row/column/box all-different regions, matching the nine drawn
// 3x3 boxes.
//
// Full Rank: the digits in the rows and columns, read in both directions,
// make 36 nine-digit numbers that are ranked 1-36 (ascending, no ties) -
// FullRankTies('none') enforces exactly that ordering constraint even though
// no individual rank is given as a clue anywhere in this puzzle. The outside
// cells that display each rank, and the "digits may not repeat within a
// cage" rule over those rank digits, are not modelled here: ISS's FullRank
// and FullRankTies handlers never expose a line's computed rank as a value
// any other constraint (Cage, AllDifferent, ...) can reference, so there is
// nothing in this encoding for a cage rule to attach to, independent of how
// well the cage geometry itself is known.
return [
  new Shape('9x9'),
  new FullRankTies('none'),
];
