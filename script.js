// Object enumeration of directions to be used with keydown handler
const directions = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

const box = new Vue({
  el: '#game-over-box',
  data: {
    visible: false,
    victory: false,
  },
  methods: {
    playAgain: function () {
      this.visible = false;
      game.newGame();
    },
  },
});

const game = new Vue({
  el: '#game',
  data: {
    // 2D array of squares and their values. Each array is a row,
    // each element within those arrays are columns
    gameArray: [],
    dimensions: 4,
    // If there are fewer cells, the game board should be bigger
    bigCells: function () {
      return this.dimensions < 6;
    },
    displayGameArray: function () {
      const display = [];
      for (const row in this.gameArray) {
        for (const col in this.gameArray[row]) {
          display.push(this.gameArray[row][col]);
        }
      }
      return display;
    },
    bgColors: {
      2: 'khaki',
      4: 'indianred',
      8: 'paleturquoise',
      16: 'yellowgreen',
      32: 'steelblue',
      64: 'hotpink',
      128: 'darkgoldenrod',
      256: 'lightsalmon',
      512: 'tomato',
      1024: 'plum',
      2048: 'orangered',
    },
  },
  methods: {
    // Start a new game with specified dimensions
    newGame: function (dim = 4) {
      // Error check dimensions
      if (!dim || dim < 2 || dim > 10) return;

      // Update game dimensions
      this.dimensions = dim;

      // Create new dimensions X dimensions game array
      this.gameArray = newArray(this.dimensions);

      this.addRandomNumber();
      this.addRandomNumber();
      box.victory = false;
    },
    // Handle keydown events
    keyHandler: function (keyValue) {
      // If key pressed is not an arrow key, escape
      if (!Object.values(directions).includes(keyValue)) return false;

      // If no move available, escape
      if (!moveAvailable(keyValue, this.gameArray)) return false;

      // A move is available

      // Copy current array
      const newArray = [...this.gameArray];

      // Shift over cells of new array, combining same numbers
      const shiftedArray = shiftArray(keyValue, newArray);

      // Update gameArray to new shifted state
      this.gameArray = shiftedArray;

      // Add a 2 or 4 randomly
      this.addRandomNumber();

      if (!box.victory) {
        this.gameArray.forEach((row) => {
          row.forEach((cell) => {
            if (cell.value == 2048) {
              this.gameEnd(true);
            }
          });
        });
      }
      // No more moves available means game over
      if (
        !moveAvailable(directions.down, this.gameArray) &&
        !moveAvailable(directions.up, this.gameArray) &&
        !moveAvailable(directions.left, this.gameArray) &&
        !moveAvailable(directions.right, this.gameArray)
      ) {
        this.gameEnd(false);
      }
    },
    // Find an empty cell, and add a number to it (2 or 4)
    addRandomNumber: function () {
      // Grab random empty cell from game
      const randCell = getRandomEmptyCell(this.gameArray);

      // Random cell found
      if (randCell) {
        const { row, col } = randCell;

        // Shallow copy array
        const newArray = [...this.gameArray];

        // Update shallow copy
        newArray[row] = newArray[row]
          .slice(0, col)
          .concat({
            id: row * this.dimensions + col,
            value: 2,
          })
          .concat(newArray[row].slice(col + 1));

        // Update game array state with new array
        this.gameArray = newArray;

        // Successful addition
        return true;
      } else {
        // No empty cells found
        return false;
      }
    },
    gameEnd: function (victory) {
      box.visible = true;
      box.victory = victory;
    },
  },
});

// Delete later
game.newGame();

// Event binding for key down
window.addEventListener('keydown', function (event) {
  // Call app's key handling method, which will update game state for arrow key press
  game.keyHandler(event.key);
});

// Helper functions!
// ---------------------------------------------------------------------

// On success: Returns {row: row, col: column}
// On fail: Returns false
// On error: Returns null
function getRandomEmptyCell(array2d) {
  // Error checking
  if (!array2d) return null;

  // Holder for all found empty cells to randomly choose from
  // const can still be modified with .push()
  const emptyCells = [];

  // Iterate through each row (array) and column (element)
  for (let row = 0; row < array2d.length; row++) {
    for (let col = 0; col < array2d[row].length; col++) {
      // Empty cell, add to available ones to choose from
      if (array2d[row][col].value == null) {
        emptyCells.push({
          row: row,
          col: col,
        });
      }
    }
  }

  // Empty cell(s) found, return one of them randomly
  // Returns: {id: X, value: Y}
  if (emptyCells.length > 0)
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  // No empty cells found
  else return false;
}

// Check that a move in a given direction is available
// Returns false if not found
function moveAvailable(direction, gameArray) {
  const dimensions = gameArray.length;
  switch (direction) {
    case directions.down:
      // For every cell, check that the cell below it will permit movement
      for (let col = 0; col < dimensions; col++) {
        for (let row = 0; row < dimensions - 1; row++) {
          // Current cell is not empty and next cell is available (same value or empty)
          const currentCell = gameArray[row][col].value;
          const nextCell = gameArray[row + 1][col].value;
          if (currentCell && (!nextCell || currentCell == nextCell)) {
            return true;
          }
        }
      }
      break;
    case directions.up:
      // For every cell, check that the cell above it will permit movement
      for (let col = 0; col < dimensions; col++) {
        for (let row = dimensions - 1; row > 0; row--) {
          // Current cell is not empty and next cell is available (same value or empty)
          const currentCell = gameArray[row][col].value;
          const nextCell = gameArray[row - 1][col].value;
          if (currentCell && (!nextCell || currentCell == nextCell)) {
            return true;
          }
        }
      }
      break;
    case directions.right:
      // For every cell, check that the cell right of it will permit movement
      for (let row = 0; row < dimensions; row++) {
        for (let col = 0; col < dimensions - 1; col++) {
          // Current cell is not empty and next cell is available (same value or empty)
          const currentCell = gameArray[row][col].value;
          const nextCell = gameArray[row][col + 1].value;
          if (currentCell && (!nextCell || currentCell == nextCell)) {
            return true;
          }
        }
      }
      break;
    case directions.left:
      // For every cell, check that the cell left of it will permit movement
      for (let row = 0; row < dimensions; row++) {
        for (let col = dimensions - 1; col > 0; col--) {
          // Current cell is not empty and next cell is available (same value or empty)
          const currentCell = gameArray[row][col].value;
          const nextCell = gameArray[row][col - 1].value;
          if (currentCell && (!nextCell || currentCell == nextCell)) {
            return true;
          }
        }
      }
      break;
  }
  return false;
}

// Take the game array given in the argument, and process an arrow key move
// Cells move over as much as possible, and combine same numbers
function shiftArray(direction, gameArray) {
  const dimensions = gameArray.length;

  // Initialize first shifted array
  const shiftedArray = newArray(dimensions);

  switch (direction) {
    case directions.down:
      for (let col = 0; col < dimensions; col++) {
        // Shifted column, top -> bottom
        const shiftedCol = [];

        // Go down the column from the start and add just the values to shifted column, no null
        for (let row = 0; row < dimensions; row++) {
          if (gameArray[row][col].value) {
            shiftedCol.push(gameArray[row][col].value);
          }
        }

        // Same numbers combined, top -> bottom
        const combinedCol = [];

        // Iterate bottom to top
        for (let row = shiftedCol.length - 1; row >= 0; row--) {
          // Two same numbers next to each other in shifted column
          if (row > 0 && shiftedCol[row] == shiftedCol[row - 1]) {
            // Add to combined column and skip next row value (same number)
            combinedCol.unshift(shiftedCol[row--] * 2);
          } else {
            combinedCol.unshift(shiftedCol[row]);
          }
        }

        // Pad start of shifted column with nulls to match array dimensions
        // Ex. [2, 4] => [null, null, 2, 4]
        while (combinedCol.length < dimensions) {
          combinedCol.unshift(null);
        }

        // Copy shifted columns into shifted array
        for (let row = 0; row < dimensions; row++) {
          shiftedArray[row][col].value = combinedCol[row];
        }
      }
      break;
    case directions.up:
      for (let col = 0; col < dimensions; col++) {
        // Shifted column
        const shiftedCol = [];

        // Go down the column from the start and add just the values to shifted column, no null
        for (let row = 0; row < dimensions; row++) {
          if (gameArray[row][col].value) {
            shiftedCol.push(gameArray[row][col].value);
          }
        }

        // Same numbers combined, top -> bottom
        const combinedCol = [];

        // Iterate top to bottom
        for (let row = 0; row < shiftedCol.length; row++) {
          // Two same numbers next to each other in shifted column
          if (
            row < shiftedCol.length - 1 &&
            shiftedCol[row] == shiftedCol[row + 1]
          ) {
            // Add to combined column and skip next row value (same number)
            combinedCol.push(shiftedCol[row++] * 2);
          } else {
            combinedCol.push(shiftedCol[row]);
          }
        }

        // Pad end of shifted column with nulls to match array dimensions
        // Ex. [2, 4] => [2, 4, null, null]
        while (combinedCol.length < dimensions) {
          combinedCol.push(null);
        }

        // Copy shifted column into shifted array
        for (let row = 0; row < dimensions; row++) {
          shiftedArray[row][col].value = combinedCol[row];
        }
      }
      break;
    case directions.right:
      for (let row = 0; row < dimensions; row++) {
        // Shifted row, left -> right
        const shiftedRow = [];

        // Go down the row from the start and add just the values to shifted row, no null
        for (let col = 0; col < dimensions; col++) {
          if (gameArray[row][col].value) {
            shiftedRow.push(gameArray[row][col].value);
          }
        }

        // Same numbers combined, top -> bottom
        const combinedRow = [];

        // Iterate right to left
        for (let col = shiftedRow.length - 1; col >= 0; col--) {
          // Two same numbers next to each other in shifted row
          if (col > 0 && shiftedRow[col] == shiftedRow[col - 1]) {
            // Add to combined column and skip next row value (same number)
            combinedRow.unshift(shiftedRow[col--] * 2);
          } else {
            combinedRow.unshift(shiftedRow[col]);
          }
        }

        // Pad start of shifted row with nulls to match array dimensions
        // Ex. [2, 4] => [null, null, 2, 4]
        while (combinedRow.length < dimensions) {
          combinedRow.unshift(null);
        }

        // Copy shifted rows into shifted array
        for (let col = 0; col < dimensions; col++) {
          shiftedArray[row][col].value = combinedRow[col];
        }
      }
      break;
    case directions.left:
      for (let row = 0; row < dimensions; row++) {
        // Shifted row
        const shiftedRow = [];

        // Go across the row from the start and add just the values to shifted row, no null
        for (let col = 0; col < dimensions; col++) {
          if (gameArray[row][col].value) {
            shiftedRow.push(gameArray[row][col].value);
          }
        }

        // Same numbers combined, top -> bottom
        const combinedRow = [];

        // Iterate left to right
        for (let col = 0; col < shiftedRow.length; col++) {
          // Two same numbers next to each other in shifted column
          if (
            col < shiftedRow.length - 1 &&
            shiftedRow[col] == shiftedRow[col + 1]
          ) {
            // Add to combined column and skip next column value (same number)
            combinedRow.push(shiftedRow[col++] * 2);
          } else {
            combinedRow.push(shiftedRow[col]);
          }
        }

        // Pad end of shifted column with nulls to match array dimensions
        // Ex. [2, 4] => [2, 4, null, null]
        while (combinedRow.length < dimensions) {
          combinedRow.push(null);
        }

        // Copy shifted column into shifted array
        for (let col = 0; col < dimensions; col++) {
          shiftedArray[row][col].value = combinedRow[col];
        }
      }
      break;
  }

  return shiftedArray;
}

// Create a new array of cell elements with id's and null values
// IDs are needed for rendering with v-for
function newArray(dimensions) {
  // Create new empty dim x dim array of nulls
  const gameArray = [];
  for (let i = 0; i < dimensions; i++) {
    const newRow = [];
    for (let j = 0; j < dimensions; j++) {
      newRow.push({
        id: i * dimensions + j,
        value: null,
      });
    }
    gameArray.push(newRow);
  }
  return gameArray;
}
