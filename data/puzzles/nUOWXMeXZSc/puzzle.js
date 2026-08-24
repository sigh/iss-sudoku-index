// Title: Ten Arrows
// Author: Elias Kar
// Video: https://www.youtube.com/watch?v=nUOWXMeXZSc
// Source: https://app.crackingthecryptic.com/sudoku/Ht3bdPRdGm

// Normal sudoku rules apply. Ten arrows: the digit in the circled bulb cell
// equals the sum of the digits along the rest of the arrow; digits may repeat
// along an arrow (Arrow permits repeats on the arm by default). Arrow colour
// (nine grey, one purple) only disambiguates overlapping paths and is not a
// rule. Bulb/shaft cells per arrow, transcribed from the drawn arrow lines
// and circle bulb markers:
return [
  new Shape('9x9'),

  // bulb R1C3, shaft R2C4-R3C5-R4C6
  new Arrow('R1C3', 'R2C4', 'R3C5', 'R4C6'),
  // bulb R2C2, shaft R3C1-R4C2
  new Arrow('R2C2', 'R3C1', 'R4C2'),
  // bulb R3C3, shaft R4C2-R5C1-R6C1-R7C1
  new Arrow('R3C3', 'R4C2', 'R5C1', 'R6C1', 'R7C1'),
  // bulb R5C3, shaft R6C2-R7C1
  new Arrow('R5C3', 'R6C2', 'R7C1'),
  // bulb R7C3, shaft R6C4
  new Arrow('R7C3', 'R6C4'),
  // bulb R9C5, shaft R8C5-R7C5-R6C5
  new Arrow('R9C5', 'R8C5', 'R7C5', 'R6C5'),
  // bulb R7C7, shaft R6C6
  new Arrow('R7C7', 'R6C6'),
  // bulb R8C8, shaft R9C7-R9C6
  new Arrow('R8C8', 'R9C7', 'R9C6'),
  // bulb R3C7, shaft R4C8-R5C9-R6C9-R7C9
  new Arrow('R3C7', 'R4C8', 'R5C9', 'R6C9', 'R7C9'),
  // bulb R1C7 (purple), shaft R2C6-R3C5-R4C4
  new Arrow('R1C7', 'R2C6', 'R3C5', 'R4C4'),
];
