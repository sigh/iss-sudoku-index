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
// cells that display each rank (and the cages requiring their digits be
// unique) are not modelled here: no rank clue value is ever given, and the
// cage boundaries are not confidently recoverable from the drawn geometry.
return [
  new Shape('9x9'),
  new FullRankTies('none'),
];
