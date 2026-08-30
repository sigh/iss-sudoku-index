// Title: A Cryptic Sudoku
// Author: Derek and Neil
// Video: https://www.youtube.com/watch?v=A3zWNh-V5js
// Source: https://cracking-the-cryptic.web.app/sudoku/LGMp2RN47t

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no metadata/rules field at all and draws no cages, lines,
// or other geometry beyond the givens and the ordinary 3x3 boxes.
const givens=[['R1C1',2],['R1C2',3],['R1C3',1],['R2C2',5],['R3C2',6],['R3C8',5],['R3C9',2],['R4C2',7],['R4C3',8],['R4C4',9],['R4C5',1],['R4C6',5],['R4C9',3],['R5C6',8],['R5C9',4],['R6C2',2],['R6C3',6],['R6C4',4],['R6C6',7],['R6C7',8],['R6C8',9],['R6C9',1],['R7C4',3],['R7C6',2],['R7C8',1],['R8C2',8],['R8C3',9],['R8C4',7],['R8C5',5],['R8C6',1],['R8C8',2],['R9C8',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
