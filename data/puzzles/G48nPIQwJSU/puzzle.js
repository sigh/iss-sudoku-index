// Title: Zip Zag
// Author: Sujoyku & Egubachu
// Video: https://www.youtube.com/watch?v=G48nPIQwJSU
// Source: https://sudokupad.app/bo63al9pzv

// Normal Sudoku rules apply. On each lavender zipper line, cells equally
// distant from its marked centre sum to the centre digit. Each literal list is
// the drawn path from one endpoint to the other; its fourth cell has the dot.
const zippers = [
  ['R1C9', 'R2C8', 'R3C7', 'R3C6', 'R3C5', 'R2C5', 'R1C5'],
  ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R6C7', 'R6C8', 'R7C9'],
  ['R8C9', 'R7C8', 'R7C7', 'R7C6', 'R8C7', 'R8C8', 'R9C9'],
  ['R9C5', 'R8C5', 'R7C5', 'R6C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R3C3', 'R3C2'],
  ['R9C2', 'R8C2', 'R7C3', 'R6C3', 'R6C2', 'R7C1', 'R8C1'],
];

return [
  new Shape('9x9'),
  ...zippers.map(cells => new Zipper(...cells)),
];
