
// Constants for X, O, and an empty cell
const X = 'X';
const O = 'O';
const EMPTY = '';

// Selecting elements
const turn = document.querySelector('#turn');
const resultMsg = document.querySelector('#result');
const reset = document.querySelector('#reset');

// Add functionality to reset button
reset.addEventListener('click', startGame);

// Returns starting state of the board.
function initialState() {
    return [
        [EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY]
    ];
}

// Returns player who has the next turn on a board.
function player(board) {
    let count = 0;
    for (const row of board) {
        for (const cell of row) {
            if (cell !== EMPTY) {
                count++;
            }
        }
    }

    return count % 2 === 0 ? X : O;
}

// Returns set of all possible actions (i, j) available on the board.
function actions(board) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === EMPTY) {
                moves.push([i, j]);
            }
        }
    }
    return moves;
}

//  Returns the board that results from making move (i, j) on the board.
function result(board, action) {
    const [x, y] = action;
    const acceptableValues = [0, 1, 2];

    // Make sure coordinates are within acceptable range
    if (!acceptableValues.includes(x) || !acceptableValues.includes(y)) {
        throw new Error('Invalid Action!');
    }

    // Make sure cell is not empty
    if (board[x][y] !== EMPTY) {
        throw new Error('Invalid Action!');
    }

    // Clone the board and update the cell with the current player
    const resultBoard = board.map(row => [...row]);
    resultBoard[x][y] = player(resultBoard);
    return resultBoard;
}

// Returns the winner of the game, if there is one.
function winner(board) {
    const winningConditions = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
    ];

    for (const condition of winningConditions) {
        const cells = [];
        for (let i = 0; i < condition.length; i++) {
            cells.push(board[condition[i][0]][condition[i][1]]);
        }

        if (cells.every(cell => cell !== EMPTY && cell === cells[0])) {
            // Highlight winning cells
            for (let i = 0; i < condition.length; i++) {
                let wc = document.querySelector(`div[data-row="${condition[i][0]}"][data-col="${condition[i][1]}"]`);
                let classes = wc.getAttribute('class');
                wc.setAttribute('class', `${classes} bg-teal-900 text-gray-200`);
            }
            return cells[0];
        }
    }
    return null;
}

// Returns True if game is over, False otherwise.
function terminal(board) {
    return (winner(board) || !actions(board).length) ? true : false;
}

// Returns 1 if X has won the game, -1 if O has won, 0 otherwise.
function utility(board) {
    const winnerMark = winner(board);
    if ((winnerMark) === X) {
        return 1;
    } else if (winnerMark === O) {
        return -1;
    } else {
        return 0;
    }
}

// Returns the optimal action for the current player on the board.
function minimax(board) {
    if (terminal(board)) return null;
    return player(board) === X ? maxValue(board)[1] : minValue(board)[1];
}


// Returns the minimum value and corresponding action for the minimizing player.
function minValue(board, alpha = -Infinity, beta = Infinity) {
    if (terminal(board)) {
        return [utility(board), null];
    }

    let minVal = Infinity;
    let bestAction;

    // Explore all possible actions
    for (const action of actions(board)) {
        const resultBoard = result(board, action);

        // Calculate the maximum value for the maximizing player after minimizing player makes a move.
        const [maxVal, _] = maxValue(resultBoard, alpha, beta);

        // Update the minimum value and corresponding best action if a better move is found
        if (maxVal < minVal) {
            minVal = maxVal;
            bestAction = action;
        }

        // Prune the search tree using alpha-beta pruning
        beta = Math.min(beta, minVal);
        if (beta <= alpha) {
            break;
        }
    }

    return [minVal, bestAction];
}

// Returns the maximum value and corresponding action for the maximizing player.
function maxValue(board, alpha = -Infinity, beta = Infinity) {
    if (terminal(board)) {
        return [utility(board), null];
    }

    let maxVal = -Infinity;
    let bestAction;

    // Explore all possible actions
    for (const action of actions(board)) {
        const resultBoard = result(board, action);

        // Calculate the minimum value for the minimizing player after maximizing player makes a move
        const [minVal, _] = minValue(resultBoard, alpha, beta);

        // Update the maximum value and corresponding best action if a better move is found
        if (minVal > maxVal) {
            maxVal = minVal;
            bestAction = action;
        }

        // Prune the search tree using alpha-beta pruning
        alpha = Math.max(alpha, maxVal);
        if (beta <= alpha) {
            break;
        }
    }

    return [maxVal, bestAction];
}

// Draws the game board based on the current state of the board
function drawBoard(board) {
    const boardUi = document.querySelector('#board');
    boardUi.innerHTML = '';
    for (let i = 0; i < board.length; i++) {
        const row = document.createElement('div');
        row.setAttribute('class', 'flex')
        for (let j = 0; j < board.length; j++) {
            const cell = document.createElement('div');

            // Set data attributes for row and column
            cell.dataset['row'] = i;
            cell.dataset['col'] = j;
            cell.textContent = board[i][j];
            cell.setAttribute('class', 'mx-1 my-1 rounded-md h-24 w-24 md:h-32 md:w-32 border flex justify-center items-center text-6xl font-bold cell')
            row.appendChild(cell);
        }
        boardUi.appendChild(row);
    }

    // Display current turn or game result
    if (!terminal(board)) {
        turn.innerText = `Current Turn: ${player(board)}`;
    } else {
        turn.innerText = '';
        const winnerMark = winner(board);
        if (winner(board)) {
            resultMsg.innerText = `${winnerMark} Won! 🎉`
        } else {
            resultMsg.innerText = 'TIE! ⚠️'
        }
        return; // Stop the Game
    }

    // If it's O's turn, make AI move
    if (player(board) === O) {
        setTimeout(() => {
            drawBoard(result(board, minimax(board)));
        }, 300);
    } else {
        // If it's X's turn, enable click event for human player
        const cells = document.querySelectorAll('.cell').forEach(cell => {
            let x = +cell.dataset['row'];
            let y = +cell.dataset['col'];
            if (board[+x][y] === EMPTY) {
                cell.addEventListener('click', () => {
                    try {
                        drawBoard(result(board, [x, y]));
                    } catch (error) {
                        // Do nothing
                        console.log(error);
                    }
                });
            }
        });
    }
}

// Starts the game by initializing the board
function startGame() {
    const board = initialState();
    const boardUi = document.querySelector('#board');
    resultMsg.innerText = '';
    drawBoard(board);
}

// Initialize the game when the page loads
startGame();