// Title: Every Carpet Must Go
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=V_9jmL376I8
// Source: https://app.crackingthecryptic.com/sudoku/3G8rJj4JGR

// Rules encoded here:
//   Normal sudoku rules apply. Digits along grey lines will read the same when
//   you roll out the grey line along the row or column, e.g. the line in box 1
//   would 'unroll' along column 1 and would read the same down column 1 as it
//   does r1c1 to r2c2.
// Nothing is omitted.

// Each grey line is a nine-cell spiral filling one box, running between a cell
// on the grid border and the centre cell of that box. Cell paths transcribed
// from the six drawn grey strokes, listed border end first.
const CARPETS = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3', 'R1C2', 'R2C2'],
  ['R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5', 'R2C5'],
  ['R1C9', 'R1C8', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R2C8'],
  ['R4C9', 'R4C8', 'R4C7', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9', 'R5C8'],
  ['R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R8C2'],
  ['R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R8C8'],
];

// Rolling a carpet out pins its border end and straightens the rest of the line
// into a ray that carries on in the direction the line already leaves that end,
// so the ray is the row or column the rules name. The example in the rules
// fixes this: box 1's spiral leaves R1C1 towards R2C1, and that carpet unrolls
// "down column 1", reading R1C1..R9C1 against the spiral R1C1..R2C2.
const unrolledRay = (carpet) => {
  const start = parseCellId(carpet[0]);
  const next = parseCellId(carpet[1]);
  const dr = next.row - start.row;
  const dc = next.col - start.col;
  return carpet.map(
    (_, i) => makeCellId(start.row + dr * i, start.col + dc * i));
};

// "Read the same" is positional: the i-th cell of the spiral holds the digit of
// the i-th cell of the ray. The first three cells of every spiral already lie
// on their own ray, so those three positions are identities and are dropped.
const carpetEqualities = CARPETS.flatMap((carpet) => {
  const ray = unrolledRay(carpet);
  return carpet
    .map((cell, i) => [cell, ray[i]])
    .filter(([a, b]) => a !== b)
    .map(([a, b]) => new SameValues(2, a, b));
});

return [
  new Shape('9x9'),

  new Given('R2C8', 1),
  new Given('R3C7', 2),
  new Given('R4C1', 3),
  new Given('R4C4', 4),
  new Given('R6C4', 5),
  new Given('R6C6', 6),
  new Given('R8C1', 8),
  new Given('R9C2', 9),
  new Given('R9C6', 7),

  ...carpetEqualities,
];
