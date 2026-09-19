// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=K976IB6LkgM

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The video
// description names only "a well-regarded Nikoli.com puzzle"; neither
// archived on-screen frame (35s, 90s) draws a cage, line, or other overlay,
// so no other clue is encoded.
const givens=[['R1C2',1],['R1C3',2],['R1C4',3],['R1C6',5],['R1C7',6],['R1C8',7],['R2C5',9],['R2C6',2],['R3C2',4],['R3C4',8],['R3C8',2],['R4C2',3],['R4C9',2],['R5C2',7],['R5C3',4],['R5C5',1],['R5C7',3],['R5C8',6],['R6C1',5],['R6C8',8],['R7C2',6],['R7C6',3],['R7C8',5],['R8C4',7],['R8C5',2],['R9C2',2],['R9C3',1],['R9C4',4],['R9C6',6],['R9C7',7],['R9C8',3]];
return [new Shape('9x9'),...givens.map(([cell,v])=>new Given(cell,v))];
