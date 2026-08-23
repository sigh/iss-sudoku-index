// Title: Cobra Roll
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=rxxn0F1TPe0
// Source: https://app.crackingthecryptic.com/sudoku/qR6b8L3htF

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The rules
// text names no other clue, and the payload draws none.
const givens=[['R1C3',2],['R1C4',3],['R1C7',5],['R2C2',1],['R2C5',4],['R2C8',9],['R3C4',5],['R3C9',6],['R4C2',7],['R4C3',6],['R5C1',8],['R5C5',2],['R5C8',4],['R6C1',9],['R6C7',8],['R6C9',3],['R7C6',5],['R7C9',2],['R8C6',6],['R8C8',1],['R9C4',8],['R9C5',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
