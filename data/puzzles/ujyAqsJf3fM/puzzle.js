// Title: No Swordfish Allowed!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ujyAqsJf3fM
// Source: https://cracking-the-cryptic.web.app/sudoku/23q38DDgQ8

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text, no cages, and no lines -- only the 28
// givens below and the ordinary 3x3 box regions ISS applies by default.
const givens=[['R1C2',9],['R1C3',5],['R1C4',4],['R1C9',1],['R2C3',1],['R2C4',7],['R2C5',8],['R2C8',2],['R3C1',6],['R3C8',9],['R4C3',8],['R4C5',1],['R5C2',5],['R5C4',8],['R5C6',7],['R5C8',4],['R6C5',9],['R6C7',5],['R7C2',1],['R7C9',6],['R8C2',6],['R8C5',4],['R8C6',8],['R8C7',3],['R9C1',3],['R9C6',2],['R9C7',9],['R9C8',1]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
