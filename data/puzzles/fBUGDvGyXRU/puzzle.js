// Title: Quantherm Entangled
// Author: rubenscube
// Video: https://www.youtube.com/watch?v=fBUGDvGyXRU
// Source: https://app.crackingthecryptic.com/sudoku/q4dQrJgphF

// Rules encoded: standard 9x9 sudoku (rows, columns, boxes all-different,
// from Shape's default regions); an anti-knight constraint (no two cells a
// knight's move apart share a digit); three thermometers, each strictly
// increasing from its bulb; and one 10-cell palindrome line. No givens.
// The three grey lines each have a matching circle drawn at their first
// endpoint, which locates the bulb; the green line is the palindrome named
// in the rules text.

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Thermometer 1: grey line, bulb-underlay at R3C7, path R3C7-R4C7-R5C7-R6C7-R7C7.
  new Thermo('R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'),

  // Thermometer 2: grey line, bulb-underlay at R6C6, path R6C6-R6C5-R5C4.
  new Thermo('R6C6', 'R6C5', 'R5C4'),

  // Thermometer 3: grey line, bulb-underlay at R6C1, path R6C1-R5C1-R4C1.
  new Thermo('R6C1', 'R5C1', 'R4C1'),

  // Palindrome: green line, 10 cells. Waypoints run R8C2-R7C2-R6C2-R5C2
  // (vertical), then bend diagonally through R4C3, R3C4 to R2C5, then
  // R2C5-R3C5-R4C5-R5C5 (vertical).
  new Palindrome(
    'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R3C5', 'R4C5', 'R5C5'),
];
