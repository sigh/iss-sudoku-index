// Title: Thermo Dot
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=YdGKSgj3FVM
// Source: https://app.crackingthecryptic.com/LMh4tRr2bP

// Normal Sudoku and disjoint groups apply. The grey thermos increase from their
// circular bulbs to their tips. The two white dots join consecutive digits.
return [
  new Shape('9x9'),
  new DisjointSets(),

  // Thermometer paths transcribed from the four grey bulb-ended lines.
  new Thermo('R2C2', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Thermo('R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Thermo('R8C8', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3'),
  new Thermo('R5C2', 'R6C2', 'R6C1', 'R5C1'),

  // White-dot edges transcribed from the two small white circles.
  new WhiteDot('R5C9', 'R6C9'),
  new WhiteDot('R5C8', 'R5C9'),
];
