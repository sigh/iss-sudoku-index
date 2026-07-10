// Title: Eye of the Beholder
// Author: oskode & Calvinball
// Video: https://www.youtube.com/watch?v=0LkWrGwclFo
// Source: https://sudokupad.app/65spa2e9w3

// Two Var cells model each unknown circle digit. Each arrow sum is allowed to
// read those two digits in either order.
const constraints = [
  new Shape('9x9'),
  new Var('Q', 'question mark circle digits', 14),
];
const NONDECREASING_PAIR = Pair.fnToKey((a, b) => a <= b, 9);

function add(constraint) {
  constraints.push(constraint);
}

function equality(a, b) {
  return new Sum('0_=_1_-1', a, b);
}

function circleContainsDigits(cells, a, b) {
  const choices = [];
  for (const first of cells) {
    for (const second of cells) {
      if (first === second) continue;
      choices.push(new And([
        equality(first, a),
        equality(second, b),
      ]));
    }
  }
  add(new Or(choices));
}

function arrowSum(cells, a, b) {
  const coeffs = [
    ...cells.map(() => 1),
    -10,
    -1,
  ].join('_');
  return new Sum(`0_=_${coeffs}`, ...cells, a, b);
}

function arrowFromCircle(cells, a, b) {
  add(new Or([
    arrowSum(cells, a, b),
    arrowSum(cells, b, a),
  ]));
}

function fixedArrowFromCircle(cells, a, b) {
  add(new Or([
    new Sum(10 * a + b, ...cells),
    new Sum(10 * b + a, ...cells),
  ]));
}

const circles = [
  {
    digits: ['VQ1', 'VQ2'],
    surround: ['R2C4', 'R2C5', 'R3C4', 'R3C5'],
    arrows: [
      ['R2C5', 'R1C6', 'R2C6'],
      ['R2C4', 'R1C3', 'R2C3'],
    ],
  },
  {
    digits: ['VQ3', 'VQ4'],
    surround: ['R4C1', 'R4C2', 'R5C1', 'R5C2'],
    arrows: [
      ['R4C2', 'R3C3', 'R3C4'],
    ],
  },
  {
    digits: ['VQ5', 'VQ6'],
    surround: ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
    arrows: [
      ['R4C9', 'R5C9', 'R6C9', 'R7C9'],
    ],
  },
  {
    digits: ['VQ7', 'VQ8'],
    surround: ['R5C4', 'R5C5', 'R6C4', 'R6C5'],
    arrows: [
      ['R6C4', 'R7C3'],
    ],
  },
  {
    digits: ['VQ9', 'VQ10'],
    surround: ['R5C6', 'R5C7', 'R6C6', 'R6C7'],
    arrows: [
      ['R6C7', 'R7C7', 'R7C8', 'R8C8', 'R9C7'],
    ],
  },
  {
    digits: ['VQ11', 'VQ12'],
    surround: ['R7C4', 'R7C5', 'R8C4', 'R8C5'],
    arrows: [
      ['R7C5', 'R6C6', 'R5C5'],
    ],
  },
  {
    digits: ['VQ13', 'VQ14'],
    surround: ['R8C5', 'R8C6', 'R9C5', 'R9C6'],
    arrows: [
      ['R9C6', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R9C3'],
    ],
  },
];

for (const circle of circles) {
  const [a, b] = circle.digits;
  add(new Pair(NONDECREASING_PAIR, 'unordered circle digits', a, b));
  circleContainsDigits(circle.surround, a, b);
  for (const cells of circle.arrows) {
    arrowFromCircle(cells, a, b);
  }
}

add(new Quad('R4C5', 1, 4));
fixedArrowFromCircle(['R4C6', 'R3C7', 'R3C8'], 1, 4);
fixedArrowFromCircle(['R4C5', 'R4C4', 'R5C4', 'R6C3', 'R6C2'], 1, 4);

return constraints;
