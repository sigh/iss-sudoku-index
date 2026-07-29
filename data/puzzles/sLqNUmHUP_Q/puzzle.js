// Title: NGN
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=sLqNUmHUP_Q
// Source: https://app.crackingthecryptic.com/gQrmDmMFtM

// Use one unknown four-digit subset of 1-9 in every row, column, and box.
// Grey circular bulbs and lines give these thermometers; the listed order is bulb first.
// The white and black dots respectively mark consecutive and 2:1 digit pairs.
// The blue-grey square at R2C1 is even.
return [
  new Shape('4x4', 9),
  new RegionSameValues(),
  new Given('R2C1', 2, 4, 6, 8),
  new Thermo('R3C1', 'R2C1'),
  new Thermo('R4C1', 'R4C2', 'R3C2'),
  new Thermo('R4C4', 'R3C4'),
  new Thermo('R2C3', 'R2C2'),
  new Thermo('R2C3', 'R3C3'),
  new Thermo('R1C3', 'R1C4', 'R2C4'),
  new WhiteDot('R1C2', 'R2C2'),
  new BlackDot('R4C3', 'R4C4'),
];
