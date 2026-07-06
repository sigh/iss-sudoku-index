# iss-sudoku-index

Browse [Cracking The Cryptic](https://www.youtube.com/@CrackingTheCryptic) sudoku
videos mapped to AI-generated [Interactive Sudoku Solver](https://sigh.github.io/Interactive-Sudoku-Solver/)
constraint scripts — each row shows how far the solver gets, with links to the video,
the puzzle source, and the puzzle loaded in ISS.

Explore it at <https://sigh.github.io/iss-sudoku-index/>.

> **Note:** the ISS constraints and scripts are AI-generated and may contain errors.

## Running locally

    python3 -m http.server 8000

## Data

The site is fully static: it fetches `data/mappings.json` and, for the Solve / Script
links, each encoded puzzle's `data/puzzles/<id>/{puzzle.iss,puzzle.js}`. These are
pre-generated data files.

## License

[MIT](LICENSE)
