// Title: 9/4/2023: 6x6 Kropki Pairs
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Mmz5bSZWA-s
// Source: http://tinyurl.com/2t89bz6f

// Normal 6x6 Sudoku with 2x3 regions. White dots mark consecutive pairs;
// black dots mark pairs with a 2:1 ratio. Other adjacent pairs are unrestricted.
return [
  new Shape('6x6'),
  new RegionSize(6),

  // Drawn white-dot pairs.
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R2C4', 'R3C4'),
  new WhiteDot('R5C2', 'R6C2'),
  new WhiteDot('R5C3', 'R4C3'),
  new WhiteDot('R4C5', 'R4C6'),
  new WhiteDot('R5C4', 'R6C4'),

  // Drawn black-dot pairs.
  new BlackDot('R2C5', 'R2C4'),
  new BlackDot('R1C5', 'R1C6'),
  new BlackDot('R6C1', 'R6C2'),
  new BlackDot('R5C2', 'R5C3'),
  new BlackDot('R3C4', 'R3C3'),
  new BlackDot('R4C3', 'R4C4'),
  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R4C1', 'R3C1'),
  new BlackDot('R4C6', 'R3C6'),
  new BlackDot('R2C3', 'R1C3'),
];
