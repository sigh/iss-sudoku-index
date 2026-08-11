// Title: Canadian Whispers
// Author: Joe Moed
// Video: https://www.youtube.com/watch?v=SNf4SzMVNZs
// Source: https://app.crackingthecryptic.com/sudoku/Pm2tG7mN8D

// Normal sudoku rules apply. The 'Maple Leaf' is a German Whisper line
// (adjacent digits differ by >= 5). The two 'Hockey Sticks' are
// Thermometers (increasing from the bulb). The three 'Hockey Pucks' are
// odd-digit cells.
//
// Drawn overlays: five grey circles total. Two of them (R9C2, R9C8) sit
// exactly on the two thermometers' bulb cells, so they are the bulb
// markers, not additional clues; the rules also name only three Hockey
// Pucks. The remaining three circles (R3C3, R3C7, R4C5) are the Hockey
// Pucks and are encoded as odd-digit givens.

// Maple Leaf: German Whisper line, transcribed from the drawn red line
// (thickness 5), path order preserved.
const mapleLeaf = [
  'R9C5', 'R8C5', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R6C3', 'R5C2', 'R4C1',
  'R4C2', 'R3C2', 'R4C3', 'R3C4', 'R2C4', 'R1C4', 'R2C5', 'R1C6', 'R2C6',
  'R3C6', 'R4C7', 'R3C8', 'R4C8', 'R4C9', 'R5C8', 'R6C7', 'R7C8', 'R7C7',
  'R7C6',
];

return [
  new Shape('9x9'),
  new Whisper(5, ...mapleLeaf),
  // Hockey Sticks: thermometers, transcribed from the two drawn grey
  // lines (thickness 12), bulb cell first.
  new Thermo('R9C2', 'R8C1', 'R7C1', 'R6C1'),
  new Thermo('R9C8', 'R8C9', 'R7C9', 'R6C9'),
  // Hockey Pucks: odd-digit givens, at the three drawn grey circles
  // that are not thermometer bulbs (R3C3, R3C7, R4C5).
  new Given('R3C3', 1, 3, 5, 7, 9),
  new Given('R3C7', 1, 3, 5, 7, 9),
  new Given('R4C5', 1, 3, 5, 7, 9),
];
