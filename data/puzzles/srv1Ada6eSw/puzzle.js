// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=srv1Ada6eSw
// Source: https://cracking-the-cryptic.web.app/sudoku/PDN3qHphTP

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The payload
// carries no rules text and draws no cages, lines, or other geometry.
const givens=[['R1C1',6],['R1C3',9],['R1C4',8],['R1C6',1],['R2C1',8],['R2C3',7],['R2C7',6],['R3C5',7],['R3C9',4],['R4C1',1],['R4C2',8],['R4C5',6],['R4C7',4],['R4C9',9],['R5C5',1],['R5C7',3],['R5C8',7],['R6C7',5],['R7C1',7],['R7C5',8],['R7C8',9],['R8C4',3],['R8C7',7],['R8C9',5],['R9C2',9],['R9C3',6],['R9C5',5],['R9C8',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
