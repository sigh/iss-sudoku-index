// Title: Whisper Zipper
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=OnZf07JvkY0
// Source: https://sudokupad.app/TFn7BhGB8R

// Six unknown digits from 1-9 occur in every row, column, and 2x3 box.
// The blue paths are zippers; the green path is a whisper line with difference 5.
return [
  new Shape('6x6', 9),
  new RegionSameValues(),
  new Zipper(
    'R2C1', 'R1C2', 'R2C3', 'R3C2', 'R4C1', 'R5C2', 'R6C3', 'R5C4',
    'R4C3', 'R3C4', 'R2C5', 'R3C6', 'R4C5', 'R5C6', 'R6C5',
  ),
  new Zipper('R1C4', 'R1C5', 'R1C6'),
  new Whisper(5, 'R2C2', 'R3C1', 'R4C2', 'R5C3'),
];
