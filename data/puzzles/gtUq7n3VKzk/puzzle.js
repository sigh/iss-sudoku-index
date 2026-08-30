// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=gtUq7n3VKzk
// Source: https://cracking-the-cryptic.web.app/sudoku/g6PBt9Hhtm

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload carries no rules text and draws no lines, cages, arrows, or
// overlays -- regions are the nine standard 3x3 boxes.
const givens=[['R1C1',4],['R1C4',3],['R1C6',6],['R1C9',9],['R2C3',1],['R2C6',4],['R2C8',7],['R3C2',5],['R3C4',8],['R3C7',2],['R4C4',6],['R4C7',4],['R5C6',8],['R6C2',8],['R6C5',4],['R6C8',1],['R7C3',8],['R7C6',3],['R8C2',4],['R8C5',5],['R8C8',9],['R9C4',1]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
