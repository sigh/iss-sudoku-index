// Title: I Heard You Like Cages
// Author: Justin Vitanza
// Video: https://www.youtube.com/watch?v=UskdN-VkW4k
// Source: https://sudokupad.app/62l02qt79r

// Normal sudoku rules apply. Each outlined cage is independently a killer cage
// (distinct digits summing to its printed clue) or a look-and-say cage (the
// clue's tens digit is the exact count of its ones digit), including both.
const cage = (clue, cells) => new Or([
  new Cage(clue, ...cells),
  new LookAndSay(clue, ...cells),
]);

// Cage cell lists transcribed from the coloured outlined cages and their top-left clues.
const cages = [
  [16, ['R1C1', 'R1C2', 'R1C3', 'R1C4']], [11, ['R1C6', 'R2C6']],
  [17, ['R1C5', 'R2C5']], [13, ['R1C2', 'R1C3']], [11, ['R2C2', 'R3C2']],
  [24, ['R2C3', 'R2C4', 'R3C4']], [24, ['R3C3', 'R4C3', 'R4C4']],
  [26, ['R3C1', 'R4C1', 'R4C2', 'R5C1', 'R5C2']], [11, ['R3C5', 'R4C5']],
  [18, ['R4C2', 'R5C1', 'R5C2']],
  [21, ['R4C6', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6']],
  [12, ['R5C6']], [14, ['R6C5', 'R7C5']], [24, ['R6C3', 'R6C4', 'R7C3']],
  [17, ['R6C1', 'R6C2']], [13, ['R6C7', 'R7C6', 'R7C7']],
  [14, ['R7C4', 'R8C3', 'R8C4']], [12, ['R7C1', 'R7C2', 'R8C1', 'R8C2']],
  [15, ['R7C9', 'R8C9']], [12, ['R8C1', 'R8C2']], [13, ['R8C5', 'R8C6']],
  [12, ['R8C7', 'R8C8']], [19, ['R5C8', 'R5C9', 'R6C8', 'R6C9']],
  [14, ['R9C2', 'R9C3']],
];

return [
  new Shape('9x9'),
  ...cages.map(([clue, cells]) => cage(clue, cells)),
];
