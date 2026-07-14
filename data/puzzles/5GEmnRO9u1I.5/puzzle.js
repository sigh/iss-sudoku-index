// Title: Variant Lesson: Thermos
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=5GEmnRO9u1I
// Source: https://sudokupad.app/73rwdplapv

// 6x6 grid, standard 2x3 boxes. Only 6 of the 9 digits 1-9 are used, each
// appearing once per row/column/box (6 times total) -- which 6 digits is for
// the solver to determine. Widen the value range to 9 so the alphabet is 9,
// then force every row/column/box (all size 6) to agree on the same 6-digit
// set via RegionSameValues.
const shape = new Shape('6x6', 9);

// Thermometers: strictly increasing from the bulb (first cell listed).
const thermos = [
  new Thermo('R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C3', 'R4C4'),
  new Thermo('R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Thermo('R3C1', 'R4C1', 'R5C1'),
  new Thermo('R5C5', 'R4C5', 'R3C5'),
];

// Black Kropki dots: one digit is double the other. Not all valid dots are
// marked, so no global negative constraint applies -- only the drawn dots.
const kropkiDots = [
  new BlackDot('R5C6', 'R6C6'),
  new BlackDot('R2C2', 'R2C3'),
];

return [
  shape,
  new RegionSameValues(),
  ...thermos,
  ...kropkiDots,
];
