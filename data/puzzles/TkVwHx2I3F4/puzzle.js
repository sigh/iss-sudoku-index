// Title: 22 (Clues) / 7 (Rows)
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=TkVwHx2I3F4
// Source: https://app.crackingthecryptic.com/sudoku/7NdfmMt8HL

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The video
// description's rules text names no other clue ("Normal sudoku rules
// apply"), and the payload draws no cages, lines, or overlays.
const givens=[['R2C3',3],['R2C5',1],['R2C7',4],['R3C1',1],['R3C4',5],['R3C6',9],['R4C5',2],['R4C7',6],['R4C8',5],['R5C1',3],['R5C2',5],['R5C8',8],['R5C9',9],['R6C2',7],['R6C3',9],['R6C5',3],['R7C4',2],['R7C6',3],['R7C9',8],['R8C3',4],['R8C5',6],['R8C7',2]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
