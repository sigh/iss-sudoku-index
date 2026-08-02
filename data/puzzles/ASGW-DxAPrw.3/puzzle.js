// Title: Oct. 17 2023: Zone or Killer?
// Author: clover!
// Video: https://www.youtube.com/watch?v=ASGW-DxAPrw
// Source: https://tinyurl.com/ymuxbba3

// Normal Sudoku rules apply. Each outlined cage is either a distinct-digit
// killer cage summing to its clue or a zone containing every digit occurrence
// written in that clue. The table transcribes the drawn cage outlines and labels.
const cageOrZone = (label, cells) => new Or([
  new Cage(Number(label), ...cells),
  new ContainAtLeast(label.split('').join('_'), ...cells),
]);

const clues = [
  ['77', ['R3C3', 'R3C4', 'R4C3']],
  ['17', ['R3C6', 'R3C7']],
  ['17', ['R4C6', 'R4C7']],
  ['55', ['R6C7', 'R7C6', 'R7C7']],
  ['15', ['R6C3', 'R6C4']],
  ['15', ['R7C3', 'R7C4']],
  ['9', ['R5C5']],
  ['19', ['R1C7', 'R1C8']],
  ['19', ['R7C9', 'R8C9']],
  ['19', ['R9C2', 'R9C3']],
  ['19', ['R2C1', 'R3C1']],
  ['9', ['R7C1', 'R8C1', 'R9C1']],
  ['9', ['R1C9', 'R2C9', 'R3C9']],
  ['23', ['R9C4', 'R9C5']],
  ['24', ['R1C5', 'R1C6']],
  ['14', ['R2C3', 'R2C4']],
  ['12', ['R3C2', 'R4C2']],
  ['13', ['R8C6', 'R8C7']],
  ['34', ['R6C8', 'R7C8']],
];

return [
  new Shape('9x9'),
  ...clues.map(([label, cells]) => cageOrZone(label, cells)),
];
