// Title: Squished donut
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=hKIawQBnvPA
// Source: https://sudokupad.app/if51ppu1k7

// Rules encoded: digits 1-8 are distinct in rows, columns, and the eight
// toroidal 4x2 boxes; adjacent orange-line digits differ by at least 4; each
// V-marked adjacent pair sums to 5. Default boxes are omitted.
// Toroidal box memberships transcribed from the eight hidden source cages.
const toroidalBoxes = [
  ['R1C2', 'R1C3', 'R1C4', 'R2C4', 'R2C3', 'R2C2', 'R1C5', 'R2C5'],
  ['R2C5', 'R2C6', 'R1C6', 'R1C5', 'R1C1', 'R2C1', 'R1C2', 'R2C2'],
  ['R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C3', 'R3C2', 'R2C5', 'R3C5'],
  ['R3C5', 'R3C6', 'R2C6', 'R2C5', 'R2C1', 'R3C1', 'R2C2', 'R3C2'],
  ['R4C2', 'R4C3', 'R4C4', 'R3C4', 'R3C3', 'R3C2', 'R3C5', 'R4C5'],
  ['R4C5', 'R4C6', 'R3C6', 'R3C5', 'R4C1', 'R3C1', 'R3C2', 'R4C2'],
  ['R4C2', 'R4C3', 'R4C4', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R4C5'],
  ['R1C5', 'R1C6', 'R4C5', 'R4C6', 'R4C1', 'R1C1', 'R4C2', 'R1C2'],
];

return [
  new Shape('4x6', 8),
  new NoBoxes(),
  ...toroidalBoxes.map(cells => new AllDifferent(...cells)),
  new Whisper(4, 'R1C3', 'R2C2', 'R3C2', 'R4C3', 'R4C4', 'R3C5', 'R2C5', 'R1C4'),
  new V('R1C1', 'R1C2'),
  new V('R4C5', 'R4C6'),
];
