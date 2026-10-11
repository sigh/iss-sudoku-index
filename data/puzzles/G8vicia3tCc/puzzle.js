// Title: Only 100 Lines!
// Author: Thenonymous
// Video: https://www.youtube.com/watch?v=G8vicia3tCc
// Source: https://sudokupad.app/s4mzidh2xu

// Normal Sudoku. White segments read left-to-right or top-to-bottom;
// the numbers on each connected grey figure sum to 100. Fog is display only.

// White strokes and white circles on the eleven drawn grey figures.
const figures = [
  [
    [
      "R4C1",
      "R4C2"
    ],
    [
      "R4C3",
      "R4C4"
    ]
  ],
  [
    [
      "R2C2"
    ],
    [
      "R2C3",
      "R3C3"
    ]
  ],
  [
    [
      "R4C6",
      "R4C7"
    ],
    [
      "R4C8",
      "R4C9"
    ]
  ],
  [
    [
      "R5C1",
      "R6C1"
    ],
    [
      "R5C2",
      "R6C2"
    ],
    [
      "R5C3",
      "R6C3"
    ]
  ],
  [
    [
      "R5C4",
      "R6C4"
    ],
    [
      "R5C5"
    ],
    [
      "R5C6"
    ],
    [
      "R5C7"
    ],
    [
      "R5C8",
      "R6C8"
    ]
  ],
  [
    [
      "R5C9",
      "R6C9"
    ],
    [
      "R7C9",
      "R8C9"
    ],
    [
      "R9C8",
      "R9C9"
    ]
  ],
  [
    [
      "R1C7",
      "R1C8"
    ],
    [
      "R1C9"
    ],
    [
      "R2C8",
      "R2C9"
    ],
    [
      "R3C9"
    ]
  ],
  [
    [
      "R1C1",
      "R1C2"
    ],
    [
      "R2C1"
    ],
    [
      "R3C1",
      "R3C2"
    ]
  ],
  [
    [
      "R7C2",
      "R7C3"
    ],
    [
      "R8C3"
    ]
  ],
  [
    [
      "R3C4"
    ],
    [
      "R2C5",
      "R2C6"
    ],
    [
      "R3C5",
      "R3C6"
    ]
  ],
  [
    [
      "R7C6"
    ],
    [
      "R8C6"
    ],
    [
      "R9C4"
    ],
    [
      "R8C4",
      "R8C5"
    ],
    [
      "R9C5",
      "R9C6"
    ]
  ]
];

// Place-value coefficients read each white segment as one decimal number.
const hundreds = figures.map(segments => new Sum(100,
  ...segments.flatMap(cells => cells.map((cell, i) =>
    [cell, 10 ** (cells.length - i - 1)]))));

return [new Shape("9x9"), ...hundreds];
