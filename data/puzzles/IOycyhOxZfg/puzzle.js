// Title: Using Brain(ium) Power
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IOycyhOxZfg
// Source: https://cracking-the-cryptic.web.app/sudoku/29hDhJJgbF

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C3',7],['R1C6',8],['R2C2',2],['R2C4',5],['R2C8',6],['R3C5',9],['R3C9',4],['R4C2',9],['R4C4',1],['R4C9',5],['R5C1',6],['R5C5',4],['R6C3',3],['R6C6',7],['R6C8',2],['R7C1',4],['R7C7',9],['R8C2',5],['R8C4',6],['R8C8',1],['R9C3',8],['R9C6',3],['R9C9',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
