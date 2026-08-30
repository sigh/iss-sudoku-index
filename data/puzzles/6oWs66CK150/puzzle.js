// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=6oWs66CK150
// Source: https://cracking-the-cryptic.web.app/sudoku/73FN293dR8

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no other clue.
const givens=[['R1C3',4],['R1C7',6],['R2C3',9],['R2C4',3],['R2C6',2],['R2C7',7],['R3C4',8],['R3C6',7],['R5C1',7],['R5C2',4],['R5C8',2],['R5C9',5],['R6C2',1],['R6C3',6],['R6C7',3],['R6C8',4],['R8C3',8],['R8C4',7],['R8C6',3],['R8C7',9],['R9C2',5],['R9C3',7],['R9C7',2],['R9C8',1]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
