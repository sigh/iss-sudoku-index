// Title: Attack of the Clones
// Author: Olof Helleblad Johnson
// Video: https://www.youtube.com/watch?v=WvRwGYliYt4
// Source: https://app.crackingthecryptic.com/b4eoe6njxe

// Standard Sudoku. Purple regions have matching row-major digits; the drawn
// diagonal, X, V, and givens are encoded directly from the source geometry.
const clones = [
  ['R1C1','R1C2','R1C3','R2C1','R2C2','R2C3','R3C1','R3C2','R3C3'],
  ['R2C7','R2C8','R2C9','R3C7','R3C8','R3C9','R4C7','R4C8','R4C9'],
  ['R6C3','R6C4','R6C5','R7C3','R7C4','R7C5','R8C3','R8C4','R8C5'],
];
const xs = [['R1C7','R1C8'],['R6C8','R6C9'],['R7C7','R7C8'],['R7C1','R8C1']];
const vs = [['R5C2','R6C2'],['R3C5','R3C6']];
return [new Shape('9x9'),new Given('R1C1',1),new Given('R2C1',7),new Given('R5C6',7),new Diagonal(-1),...Array.from({length:9},(_,i)=>new SameValues(3,clones[0][i],clones[1][i],clones[2][i])),...xs.map(p=>new X(...p)),...vs.map(p=>new V(...p))];
