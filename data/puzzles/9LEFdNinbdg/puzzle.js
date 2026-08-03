// Title: x'clusion
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=9LEFdNinbdg
// Source: https://app.crackingthecryptic.com/sudoku/MLdnq2THJ4

// Standard 9x9 sudoku. Knight-separated cells differ. Two killer cages sum
// to their corner totals. Seven thermometers share three bulb cells (a bulb
// is the low end of every arm drawn from it); each arm increases from its
// bulb. The drawn paths are bulb-first.
const thermometers = [
  new Thermo('R5C5', 'R4C4', 'R3C3'),
  new Thermo('R5C5', 'R6C6', 'R7C7'),
  new Thermo('R5C5', 'R6C4', 'R7C3'),
  new Thermo('R5C5', 'R4C6', 'R3C7', 'R2C7', 'R1C7'),
  new Thermo('R7C8', 'R8C8', 'R9C7'),
  new Thermo('R7C8', 'R6C8', 'R5C8'),
  new Thermo('R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C5'),
];

const cages = [
  new Cage(11, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(13, 'R7C1', 'R7C2'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  ...thermometers,
];
