// Title: Diamonds
// Author: GoodCity
// Video: https://www.youtube.com/watch?v=Qwz-czB8XMk
// Source: https://app.crackingthecryptic.com/RLB3gF88pq

// Normal Sudoku rules apply. Each circled digit equals the sum of the digits
// on every attached arrow; arrow digits may repeat.
return [
  new Shape('9x9'),
  // Arrow paths transcribed from the drawn circle-and-shaft geometry.
  new Arrow('R6C5', 'R7C5', 'R8C4', 'R8C3'),
  new Arrow('R5C6', 'R5C7', 'R4C8', 'R4C9'),
  new Arrow('R5C6', 'R4C7'),
  new Arrow('R6C6', 'R7C6', 'R8C7'),
  new Arrow('R6C6', 'R6C7', 'R7C8'),
  new Arrow('R6C6', 'R7C7', 'R8C8'),
  new Arrow('R4C4', 'R3C3', 'R2C2'),
  new Arrow('R4C4', 'R4C3', 'R3C2'),
  new Arrow('R4C4', 'R3C4', 'R2C3'),
  new Arrow('R5C4', 'R5C3', 'R6C2', 'R6C1'),
  new Arrow('R4C5', 'R3C5', 'R2C6'),
  new Arrow('R4C5', 'R3C6'),
  new Arrow('R6C4', 'R7C3'),
];
