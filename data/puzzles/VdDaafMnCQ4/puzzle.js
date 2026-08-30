// Title: Argyle Sudoku
// Author: Li Qianzi
// Video: https://www.youtube.com/watch?v=VdDaafMnCQ4
// Source: https://cracking-the-cryptic.web.app/sudoku/7N3dGTnh97

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default).
//
// The source publishes no rules text at all (empty metadata object, no
// rules pseudo-cage), so only the givens below are encoded. Eight light-grey
// (#CFCFCF) diagonal line segments are drawn across the grid (the NW-SE
// diagonals at row-col in {-4,-1,1,4} and the NE-SW diagonals at row+col in
// {4,7,9,12}), but nothing local states what they require of the digits on
// them, so they are omitted here rather than guessed.
const givens=[['R1C4',2],['R2C1',3],['R2C3',2],['R3C7',8],['R4C1',7],['R4C6',9],['R4C9',2],['R5C2',8],['R5C8',1],['R6C1',4],['R6C4',1],['R6C9',7],['R7C3',5],['R8C7',6],['R8C9',9],['R9C6',2]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
