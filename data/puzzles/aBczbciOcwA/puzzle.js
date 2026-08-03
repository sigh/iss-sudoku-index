// Title: Circles and Thermos
// Author: stimim
// Video: https://www.youtube.com/watch?v=aBczbciOcwA
// Source: https://app.crackingthecryptic.com/sudoku/dGL3DgJgJd

// A digit in a circle counts how many circles (over the whole grid) hold that
// digit -- CountingCircles expresses this directly. Circle cells, from the
// underlay layer (grey fill, black border, 0.884x0.884 -- distinct from the
// smaller, borderless thermo-bulb underlay layer at the same size class).
const circles = new CountingCircles(
  'R1C9', 'R3C1', 'R3C3', 'R3C5', 'R3C7', 'R4C2', 'R4C4', 'R4C6',
  'R5C1', 'R5C3', 'R5C5', 'R5C7', 'R6C2', 'R6C4', 'R6C6',
  'R7C1', 'R7C3', 'R7C5', 'R7C7', 'R8C2', 'R8C4', 'R8C6',
  'R9C1', 'R9C3', 'R9C5', 'R9C7');

// Four thermometers, bulb cell first (bulb-first order from each line's
// wayPoints); digits strictly increase away from the bulb. Each bulb cell
// (R9C1, R9C3, R5C3, R5C7) is one of the circles above.
const thermometers = [
  new Thermo('R9C1', 'R8C1', 'R7C2', 'R6C1'),
  new Thermo('R9C3', 'R8C3', 'R7C4', 'R6C3'),
  new Thermo('R5C3', 'R4C3', 'R3C4', 'R2C3'),
  new Thermo('R5C7', 'R5C8', 'R4C8', 'R4C9'),
];

return [
  new Shape('9x9'),
  circles,
  ...thermometers,
];
