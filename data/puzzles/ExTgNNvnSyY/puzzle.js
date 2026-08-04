// Title: Exclusion
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=ExTgNNvnSyY
// Source: https://app.crackingthecryptic.com/sudoku/Ln8JDNTH8r

// Normal sudoku rules apply. Digits increase along a thermometer starting
// from the bulb end (Thermo, bulb-first). The digits on a purple line form
// a non-repeating, consecutive set, any order (Renban). Thermometers and
// purple lines are separate drawn entries distinguished by colour; a few
// pairs happen to share an endpoint cell (e.g. thermometer 4's bulb R4C7
// is also purple line 4's first cell; thermometer 5 and purple line 5 both
// pass through R3C5) but are not one continuous stroke.

const thermos = [
  ['R1C2', 'R2C2', 'R3C2', 'R4C3'],
  ['R9C8', 'R8C8', 'R7C8', 'R6C9', 'R5C9'],
  ['R4C9', 'R4C8', 'R5C7', 'R6C7'],
  ['R4C7', 'R3C7'],
  ['R4C4', 'R3C5', 'R2C6'],
  ['R7C3', 'R7C4', 'R6C4'],
].map(cells => new Thermo(...cells));

const renbans = [
  ['R5C1', 'R6C1', 'R7C2', 'R8C2', 'R9C2'],
  ['R6C3', 'R5C3', 'R4C2', 'R4C1'],
  ['R3C3', 'R4C3'],
  ['R4C7', 'R3C8', 'R2C8', 'R1C8'],
  ['R4C6', 'R3C5', 'R2C4'],
  ['R7C7', 'R7C6', 'R6C6'],
].map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...thermos,
  ...renbans,
];
