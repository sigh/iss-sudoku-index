// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=xP3lFU4jlwc
// Source: https://cracking-the-cryptic.web.app/sudoku/72nRNPTG7p

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C2',2],['R1C3',3],['R1C6',5],['R1C7',9],['R2C2',8],['R2C3',4],['R2C8',6],['R3C4',7],['R4C6',8],['R5C2',6],['R5C7',2],['R5C8',4],['R6C3',2],['R6C4',9],['R6C7',1],['R6C8',3],['R7C3',9],['R7C4',4],['R7C9',3],['R8C5',2],['R9C1',1],['R9C6',6],['R9C7',5]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
