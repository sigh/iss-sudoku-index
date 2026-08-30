// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=KKdgn0c2CJY
// Source: https://cracking-the-cryptic.web.app/sudoku/9GfnjLqpnL

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's metadata.rules is empty and no clue geometry is drawn beyond
// the givens.
const givens=[['R1C9',2],['R2C4',9],['R2C6',7],['R2C8',3],['R3C1',4],['R3C4',1],['R3C7',8],['R4C1',5],['R4C3',3],['R4C4',7],['R4C6',4],['R4C8',9],['R5C3',6],['R5C7',2],['R6C2',4],['R6C4',6],['R6C6',2],['R6C7',5],['R6C9',1],['R7C3',9],['R7C6',6],['R7C9',4],['R8C2',1],['R8C4',4],['R8C6',8],['R9C1',2]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
