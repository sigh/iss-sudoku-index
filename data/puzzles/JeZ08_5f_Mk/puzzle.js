// Title: Sorry, could you repeat that?
// Author: Chris Napolitano
// Video: https://www.youtube.com/watch?v=JeZ08_5f_Mk
// Source: https://sudokupad.app/15v4c7jldc

// Each green line has exactly one repeated digit. The repeatValue cells expose
// those five digits so AllDifferent can prevent a digit repeating on two lines.
const lines = [
  ['R2C2', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C1'],
  ['R9C7', 'R9C6', 'R8C5', 'R8C6', 'R7C5'],
  ['R2C8', 'R2C7', 'R3C6', 'R4C7', 'R5C6', 'R5C5'],
  ['R2C4', 'R3C4', 'R4C4', 'R4C5'],
  ['R8C7', 'R7C7', 'R6C7', 'R6C8'],
];
const repeatValue = new Var('R', 'Green line repeated digit', lines.length);
const distinctCount = new Var('D', 'Green line distinct count', lines.length);

const repeatRules = lines.flatMap((cells, i) => {
  const repeatCell = repeatValue.cells()[i];
  const countCell = distinctCount.cells()[i];
  const repeatChoices = Array.from({length: 9}, (_, d) => new And([
    new Given(repeatCell, d + 1),
    new ContainExact(`${d + 1}_${d + 1}`, ...cells),
  ]));
  return [
    new Whisper(5, ...cells),
    new Given(countCell, cells.length - 1),
    new CountDistinct(countCell, ...cells),
    new Or(repeatChoices),
  ];
});

const cages = [
  new Cage(26, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(20, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(32, 'R2C6', 'R2C7', 'R3C6', 'R4C6', 'R5C5', 'R5C6'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  repeatValue,
  distinctCount,
  new AllDifferent(...repeatValue.cells()),
  ...repeatRules,
  ...cages,
];
