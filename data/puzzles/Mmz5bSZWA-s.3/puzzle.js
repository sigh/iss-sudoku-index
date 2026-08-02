// Title: 9/4/2023: 6x6 Thermo
// Author: ???
// Video: https://www.youtube.com/watch?v=Mmz5bSZWA-s
// Source: http://tinyurl.com/yc2zvp99

// Normal 6x6 sudoku rules and the 18 drawn thermometers, each listed bulb to tip.
return [
  new Shape('6x6'),
  new Thermo('R1C1', 'R2C1'),
  new Thermo('R1C2', 'R2C2'),
  new Thermo('R1C3', 'R2C3'),
  new Thermo('R2C6', 'R2C5'),
  new Thermo('R1C4', 'R2C4'),
  new Thermo('R1C6', 'R1C5'),
  new Thermo('R3C6', 'R3C5'),
  new Thermo('R4C6', 'R4C5'),
  new Thermo('R3C4', 'R3C3'),
  new Thermo('R3C1', 'R4C1'),
  new Thermo('R4C2', 'R3C2'),
  new Thermo('R5C3', 'R4C3'),
  new Thermo('R5C5', 'R5C6'),
  new Thermo('R6C6', 'R6C5'),
  new Thermo('R5C4', 'R4C4'),
  new Thermo('R6C4', 'R6C3'),
  new Thermo('R6C2', 'R5C2'),
  new Thermo('R6C1', 'R5C1'),
];
