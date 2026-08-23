// Title: Binary Fission
// Author: shye
// Video: https://www.youtube.com/watch?v=ynkkMxQPUpk
// Source: https://app.crackingthecryptic.com/sudoku/rJDLMnH7LB

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C3',5],['R1C5',2],['R1C7',6],['R2C2',9],['R2C6',4],['R2C8',1],['R3C1',2],['R3C4',5],['R3C9',3],['R4C3',6],['R4C5',3],['R5C4',8],['R5C6',1],['R6C5',9],['R6C7',4],['R7C1',3],['R7C6',2],['R7C9',7],['R8C2',1],['R8C4',9],['R8C8',5],['R9C3',4],['R9C5',6],['R9C7',8]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
