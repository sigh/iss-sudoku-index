// Title: Difference Of Squares
// Author: MathGuy_12
// Video: https://www.youtube.com/watch?v=qvfBBhhCLxo
// Source: https://app.crackingthecryptic.com/sudoku/8HQfQ4tD9q

// Normal Sudoku. Purple lines are renban lines; arrows have their bulb first.
// Cage digits may repeat. The expression cages use positive integers X > Y;
// the square-sum cage bounds X to 1..9, so each possible ordered pair is explicit.
const expressionCases = [];
for (let x = 2; x <= 9; x++) {
  for (let y = 1; y < x; y++) {
    expressionCases.push(new And([
      new Sum(x, 'R1C9', 'R2C9'),
      new Sum(y * y, 'R1C4', 'R2C4', 'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4'),
      new Sum(x - y, 'R7C4'),
      new Sum(x - y, 'R9C8'),
      new Sum(y, 'R9C1', 'R9C2'),
      new Sum(x * x, 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R7C5', 'R7C6', 'R7C7', 'R8C6'),
    ]));
  }
}

return [
  new Shape('9x9'),
  // Drawn cage data: the numeric 15 cage is the only fixed-total cage.
  new Sum(15, 'R7C1', 'R7C2', 'R7C3'),
  new Or(expressionCases),
  new Arrow('R5C8', 'R4C9', 'R3C9'),
  new Arrow('R8C5', 'R9C4', 'R9C3'),
  new Arrow('R9C9', 'R8C8', 'R7C8', 'R8C7'),
  new Arrow('R3C7', 'R2C6', 'R1C5'),
  new Arrow('R4C4', 'R3C3', 'R2C2'),
  new Arrow('R7C3', 'R6C2', 'R5C1'),
  new Renban('R1C2', 'R1C1', 'R2C1'),
  new Renban('R1C4', 'R2C4', 'R3C4'),
  new Renban('R4C3', 'R4C2', 'R4C1'),
  new Renban('R1C8', 'R2C9'),
  new Renban('R4C5', 'R5C4', 'R5C5'),
  new Renban('R8C4', 'R9C5'),
  new Renban('R9C6', 'R8C7'),
];
