// Title: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=lOAWdJb5J8k
// Source: https://cracking-the-cryptic.web.app/sudoku/HN9JpHNGPH

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload draws no rules text, cages, or lines, and the regions listed are
// the ordinary 3x3 boxes -- no other clue to encode.
const givens=[['R1C3',1],['R1C4',2],['R1C6',3],['R1C7',4],['R2C4',6],['R2C6',7],['R3C1',5],['R3C9',3],['R4C1',3],['R4C2',7],['R4C8',8],['R4C9',1],['R6C1',6],['R6C2',2],['R6C8',3],['R6C9',7],['R7C1',1],['R7C9',8],['R8C4',8],['R8C6',5],['R9C3',6],['R9C4',4],['R9C6',2],['R9C7',5]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
