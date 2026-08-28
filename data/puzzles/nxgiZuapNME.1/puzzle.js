// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=nxgiZuapNME
// Source: https://cracking-the-cryptic.web.app/sudoku/G3BF68J39D

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The video
// description names no other rule, and the payload draws none.
const givens=[['R1C3',8],['R1C4',5],['R1C6',1],['R1C7',4],['R2C7',3],['R3C1',7],['R3C3',6],['R4C5',9],['R4C6',8],['R4C8',6],['R5C2',3],['R5C4',1],['R5C8',7],['R6C1',5],['R6C8',4],['R7C1',2],['R7C6',4],['R8C2',8],['R8C4',3],['R8C8',2],['R8C9',1],['R9C2',9],['R9C7',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
