// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4-AxXjNfHv8
// Source: https://app.crackingthecryptic.com/sudoku/qLDgD6mF2N

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The
// payload's regions array is nine standard 3x3 boxes (the default), and the
// rules text (from the shared video description, "Normal sudoku rules
// apply.") names no other clue.
const givens=[['R1C2',1],['R1C5',2],['R2C1',6],['R2C3',3],['R2C4',5],['R2C6',7],['R2C9',2],['R3C1',7],['R3C4',8],['R3C6',6],['R4C7',5],['R4C8',1],['R5C1',2],['R5C7',9],['R5C8',7],['R6C5',4],['R7C2',3],['R7C4',6],['R7C8',5],['R8C2',4],['R8C6',3],['R9C3',9],['R9C5',7]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
