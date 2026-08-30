// Title: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=eBs5N99m1aA
// Source: https://cracking-the-cryptic.web.app/sudoku/bH9D6pqRGm

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The payload
// carries no rules text and draws no cages, lines, or other geometry, so no
// other clue is encoded.
const givens=[['R1C1',1],['R1C2',2],['R1C4',3],['R1C6',4],['R1C8',7],['R1C9',8],['R2C1',3],['R2C4',8],['R2C6',7],['R2C9',9],['R4C1',2],['R4C2',9],['R4C8',8],['R4C9',4],['R5C5',8],['R6C1',7],['R6C2',8],['R6C8',1],['R6C9',3],['R8C1',4],['R8C4',9],['R8C6',2],['R8C9',6],['R9C1',9],['R9C2',3],['R9C4',1],['R9C6',8],['R9C8',4],['R9C9',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
