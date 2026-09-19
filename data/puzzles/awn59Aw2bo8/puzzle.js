// Title: Classic Sudoku
// Author: Oku-Yama
// Video: https://www.youtube.com/watch?v=awn59Aw2bo8

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. No rules
// text is drawn or spoken beyond this -- the on-screen grid shows givens
// only, no cages/lines/other geometry -- so no other clue is encoded.
const givens=[['R2C2',1],['R2C4',2],['R2C6',3],['R2C8',4],['R3C3',5],['R3C5',6],['R3C7',7],['R4C2',4],['R4C4',8],['R4C6',5],['R4C8',3],['R6C2',7],['R6C4',6],['R6C6',1],['R6C8',2],['R7C3',8],['R7C5',5],['R7C7',6],['R8C2',2],['R8C4',3],['R8C6',4],['R8C8',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
