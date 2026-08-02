// Title: Point of View
// Author: Nordy
// Video: https://www.youtube.com/watch?v=ZcheNLcA64Q
// Source: https://app.crackingthecryptic.com/TrgbQfmrtH

// Normal Sudoku rules apply. The rising marked diagonal has no repeated digit.
// The blue-line equal-sum rule is omitted: the local payload draws one diagonal
// stroke and six closed strokes, but does not determine the grouping needed by
// that rule. White and black dots indicate consecutive digits and a 2:1 ratio.

return [
  new Shape('9x9'),
  new Diagonal(1),
  new WhiteDot('R1C5', 'R2C5'),
  new BlackDot('R8C5', 'R9C5'),
];
