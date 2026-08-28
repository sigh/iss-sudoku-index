// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=k8fSrnQ9QJ4
// Source: https://cracking-the-cryptic.web.app/sudoku/49Qh9D9jRR

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C2',6],['R1C4',9],['R1C6',2],['R1C7',8],['R2C5',5],['R2C6',8],['R3C4',7],['R3C7',5],['R3C8',1],['R4C1',4],['R4C3',9],['R4C5',3],['R4C8',5],['R5C1',8],['R5C9',6],['R6C2',1],['R6C5',8],['R6C7',2],['R6C9',9],['R7C2',4],['R7C3',1],['R7C6',9],['R8C4',3],['R8C5',2],['R9C3',3],['R9C4',1],['R9C6',5],['R9C8',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
