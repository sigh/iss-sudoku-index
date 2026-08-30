// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=niVXPy7ORac
// Source: https://cracking-the-cryptic.web.app/sudoku/HjBjhHnMM6

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',8],['R1C3',3],['R1C6',5],['R1C7',2],['R2C2',6],['R2C7',3],['R3C3',1],['R3C5',6],['R3C6',4],['R4C3',8],['R4C5',3],['R4C8',9],['R5C1',6],['R5C5',1],['R5C9',2],['R6C2',3],['R6C5',4],['R6C7',6],['R7C4',7],['R7C5',2],['R7C7',9],['R8C3',7],['R8C8',2],['R9C3',4],['R9C4',8],['R9C7',7],['R9C9',5]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
