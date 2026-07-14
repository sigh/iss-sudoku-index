// Title: SVS #454 - Little Thermometers
// Author: Richard
// Video: https://www.youtube.com/watch?v=-9if2VK7KKc
// Source: https://sudokupad.app/2ofk8u9afe

// Normal sudoku rules apply. No given digits.
//
// Each outside clue marks a thermometer somewhere along the diagonal ray
// running from the edge cell nearest the clue into the grid (rays below,
// nearest-clue cell first). A thermometer: digits strictly increase from the
// bulb (nearest the clue) to the tip, are all different, is >= 3 cells, and
// sums to the clue. It is maximal along its ray -- the cell just nearer the
// clue than the bulb (if any) is not smaller than the bulb, and the cell
// just past the tip (if any) is not larger than the tip -- so which stretch
// of the ray is the thermometer is part of the puzzle, not fixed by the
// clue's position alone; every placement consistent with that maximality is
// tried via Or. Thermometers may overlap other thermometers (no encoding
// needed; nothing forbids it).

const rays = [
  { total: 21, cells: ['R1C3', 'R2C2', 'R3C1'] },
  { total: 16, cells: ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'] },
  { total: 20, cells: ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'] },
  { total: 13, cells: ['R3C9', 'R2C8', 'R1C7'] },
  { total: 7, cells: ['R4C9', 'R3C8', 'R2C7', 'R1C6'] },
  { total: 15, cells: ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'] },
  { total: 34, cells: ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'] },
  { total: 25, cells: ['R6C1', 'R7C2', 'R8C3', 'R9C4'] },
  { total: 17, cells: ['R7C1', 'R8C2', 'R9C3'] },
];

// a >= b, reused for both maximality checks below (just with the two cells
// swapped), since "not smaller than" / "not larger than" are the same
// relation read from either side.
const geqKey = Pair.fnToKey((a, b) => a >= b, 9);

const thermoChoices = rays.map(({ total, cells }) => {
  const n = cells.length;
  const placements = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      const span = cells.slice(i, j + 1);
      const parts = [new Thermo(...span), new Sum(total, ...span)];
      if (i > 0) {
        // Cell nearer the clue than the bulb: not smaller than the bulb.
        parts.push(new Pair(geqKey, '', cells[i - 1], cells[i]));
      }
      if (j < n - 1) {
        // Cell past the tip: not larger than the tip.
        parts.push(new Pair(geqKey, '', cells[j], cells[j + 1]));
      }
      placements.push(new And(parts));
    }
  }
  return new Or(placements);
});

return [
  new Shape('9x9'),
  ...thermoChoices,
];
