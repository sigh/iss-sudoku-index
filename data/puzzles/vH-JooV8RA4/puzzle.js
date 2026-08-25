// Title: Tatooine Sunset
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vH-JooV8RA4
// Source: https://app.crackingthecryptic.com/webapp/6f3g77tNJ7

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R2C3',9],['R2C4',8],['R2C9',7],['R3C2',8],['R3C5',6],['R3C8',5],['R4C2',5],['R4C5',4],['R4C8',3],['R5C3',7],['R5C4',9],['R5C9',2],['R7C3',2],['R7C4',7],['R7C9',9],['R8C2',4],['R8C5',5],['R8C8',6],['R9C1',3],['R9C6',6],['R9C7',2]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
