// Title: Less Is More
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=0LI6qhFl7SU
// Source: https://app.crackingthecryptic.com/sudoku/8nmhP8pFhR

// Normal sudoku rules apply (default row/column/box all-different).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Digits along an arrow sum to the digit in the circle -> Arrow(bulb, ...arm).
// The circle at R3C5 carries two separate arrow arms drawn from one bulb;
// each arm sums independently to R3C5's digit.
// Digits in a cage sum to the total given -> Cage(total, ...cells) (also
// enforces the killer distinct-within-cage default).
// A black dot indicates a 1:2 ratio between the digits it connects ->
// BlackDot (adjacent cell pairs only; matches the drawn edge-sized dots).

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Arrow arm cells as drawn, bulb cell taken from the matching circle.
  new Arrow('R5C4', 'R4C5', 'R4C6', 'R5C6'),
  new Arrow('R1C4', 'R1C5', 'R2C5', 'R2C4'),
  new Arrow('R3C5', 'R3C4', 'R3C3'),
  new Arrow('R3C5', 'R3C6', 'R3C7', 'R3C8'),

  // Cages as drawn.
  new Cage(27, 'R1C3', 'R2C3', 'R3C1', 'R3C2', 'R3C3'),
  new Cage(27, 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'),
  new Cage(27, 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R9C7'),

  // Black dots, cell pairs as drawn.
  new BlackDot('R2C3', 'R3C3'),
  new BlackDot('R3C2', 'R3C3'),
  new BlackDot('R7C7', 'R8C7'),
  new BlackDot('R7C7', 'R7C8'),
];
