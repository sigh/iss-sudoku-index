// Title: Generic Title
// Author: Sayori
// Video: https://www.youtube.com/watch?v=nSwsSRVwmiE
// Source: https://sudokupad.app/rmmuf81aes

// Normal Sudoku, increasing thermometers, white consecutive dots and black ratio dots.
// Not all dots are given.
// Paths and pairs below are the drawn thermometers and dots.
const thermos = [
  [
    "R8C3",
    "R9C4",
    "R9C5",
    "R9C6"
  ],
  [
    "R8C3",
    "R7C4"
  ],
  [
    "R2C3",
    "R1C4"
  ],
  [
    "R2C3",
    "R3C4",
    "R3C5",
    "R3C6"
  ],
  [
    "R4C3",
    "R4C4",
    "R5C4",
    "R6C4"
  ],
  [
    "R2C7",
    "R1C6"
  ],
  [
    "R8C7",
    "R7C6"
  ],
  [
    "R1C9",
    "R2C8",
    "R3C8",
    "R4C9"
  ],
  [
    "R6C9",
    "R5C9",
    "R4C8"
  ],
  [
    "R5C1",
    "R5C2",
    "R6C2"
  ],
  [
    "R6C7",
    "R6C6"
  ],
  [
    "R7C1",
    "R8C1",
    "R9C2"
  ],
  [
    "R1C2",
    "R2C2"
  ]
];
const whiteDots = [
  [
    "R8C4",
    "R8C3"
  ],
  [
    "R2C4",
    "R2C3"
  ],
  [
    "R4C3",
    "R5C3"
  ],
  [
    "R1C7",
    "R2C7"
  ],
  [
    "R1C9",
    "R1C8"
  ],
  [
    "R3C5",
    "R4C5"
  ],
  [
    "R7C1",
    "R6C1"
  ]
];
const blackDots = [
  [
    "R7C5",
    "R7C6"
  ],
  [
    "R1C6",
    "R1C5"
  ]
];

return [
  new Shape("9x9"),
  ...thermos.map(cells => new Thermo(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
