// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mi2JMa9cF6M
// Source: https://app.crackingthecryptic.com/BNj3frR6hN

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R2C3',3],['R2C4',8],['R2C5',6],['R2C6',2],['R2C8',1],['R3C1',6],['R3C4',4],['R3C7',7],['R3C8',8],['R4C5',3],['R4C7',8],['R5C2',5],['R5C4',1],['R5C6',9],['R5C8',4],['R6C3',9],['R7C2',6],['R7C4',9],['R7C6',4],['R7C9',5],['R8C2',1],['R8C4',6],['R8C5',7],['R8C6',5],['R8C7',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
