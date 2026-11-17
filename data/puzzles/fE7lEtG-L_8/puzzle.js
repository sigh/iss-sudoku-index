// Title: Poppy
// Author: jsmirob
// Video: https://www.youtube.com/watch?v=fE7lEtG-L_8
// Source: https://sudokupad.app/yimdu5tbmu

// Place 1-9 in each row, column and drawn region. Cages have distinct
// digits with their printed sum. The thermometer increases from its bulb.
// Region labels transcribed from the drawn thick borders.
const regionRows = [
  "AAAACCCCC",
  "AABBBBBCC",
  "ADDDBBBFC",
  "ADDEEEBFC",
  "ADDEEEFFI",
  "GDHEEEFFI",
  "GDHHHFFFI",
  "GGHHHHHII",
  "GGGGGIIII"
];
const regions = [...'ABCDEFGHI'].map(label => new Jigsaw('9x9',
  ...regionRows.flatMap((row, r) => [...row].flatMap((entry, c) =>
    entry === label ? [makeCellId(r + 1, c + 1)] : []))));

// Cage totals and cell lists from the nine dashed cages.
const cages = [
  new Cage(16, 'R3C3', 'R3C4', 'R4C3', 'R5C3'),
  new Cage(30, 'R3C5', 'R3C6', 'R3C7', 'R4C7'),
  new Cage(16, 'R5C7', 'R6C7', 'R7C6', 'R7C7'),
  new Cage(29, 'R6C3', 'R7C3', 'R7C4', 'R7C5'),
  new Cage(12, 'R1C1', 'R2C1'),
  new Cage(14, 'R8C9', 'R9C9'),
  new Cage(15, 'R8C2', 'R8C3', 'R9C2'),
  new Cage(12, 'R1C7', 'R2C6', 'R2C7'),
  new Cage(15, 'R4C8', 'R4C9', 'R5C8'),
 ];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions,
  ...cages,
  // Drawn thermometer path, starting at the central bulb.
  new Thermo('R5C5', 'R5C6', 'R4C5', 'R5C4', 'R6C5'),
];
