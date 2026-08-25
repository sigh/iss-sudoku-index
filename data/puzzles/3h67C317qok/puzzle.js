// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=3h67C317qok
// Source: https://app.crackingthecryptic.com/N6DmjH8Dd3

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C1',7],['R1C2',2],['R1C3',6],['R1C5',5],['R1C8',9],['R1C9',3],['R2C2',5],['R3C1',3],['R3C7',8],['R4C2',8],['R4C5',6],['R4C6',7],['R5C1',6],['R5C4',5],['R5C5',8],['R5C6',3],['R5C9',2],['R6C4',4],['R6C5',2],['R6C8',6],['R7C3',9],['R7C9',6],['R8C8',8],['R9C1',5],['R9C2',7],['R9C5',3],['R9C7',4],['R9C8',1],['R9C9',9]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
