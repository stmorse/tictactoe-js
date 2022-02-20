
function checkWin(b) {
	let checks = [[0,1,2],[3,4,5],[6,7,8], [0,4,8],
				  [0,3,6],[1,4,7],[2,5,8], [2,4,6]];

	for (let c of checks) {
		r = 0;
		for (let e of c) {
			r += b[e];
		}
		if (Math.abs(r) == 3) {
			return {'result': Math.sign(r), 'pattern': c};
		}
	}
	return {'result': 0, 'pattern': -1};
}


function getRandomMove(b) {
	// get open squares
	let open = [];
	for (let i in b) {
		if (b[i] == 0) {
			open.push(i);
		}
	}

	// pick random from open
	let ix = Math.floor(Math.random() * open.length);
	return {'spot': open[ix], 'value': 0};
}


function getMinimaxMove(b, p) {
	let res = {'spot': -1, 'value': 0};

	// check if win
	let check = checkWin(b);
	if (check.result != 0) {
		res.value = check.result;
		return res;
	}

	// check all possible remaining plays
	let spots = [];
	let values = [];
	for (let i in b) {
		// skip un-open squares
		if (b[i] != 0) {
			continue;
		}

		// copy board, make move, record outcome
		bcopy = b.slice();
		bcopy[i] = p;
		spots.push(i);
		values.push( getMinimaxMove(bcopy, p*(-1)).value );
	}

	// check if there were no open spots (cats game)
	if (values.length == 0) {
		return res;
	}

	// pick best (min/max) of possibilities
	let m = -1;
	if (p == -1) {
		m = values.indexOf(Math.min(...values));
	} else {
		m = values.indexOf(Math.max(...values));
	}

	// return best
	res.spot = spots[m];
	res.value = values[m];
	return res;
}


$(document).ready(function () {

	// by construction, it is ALWAYS true that
	// player1 == 1 == X
	// player2 == -1 == O
	// and on singleplayer, computer is ALWAYS player2
	// only startingPlayer changes

	var XS = '\u2573';
	var OS = '\u25EF';

	var p1_wins = 0;
	var p2_wins = 0;
	var ties = 0;

	var player1 = 1;
	var player2 = -1;
	var startingPlayer = player1;
	var currentPlayer = player1;
	var multiplayer = false;
	var board = [0,0,0, 0,0,0, 0,0,0];
	var gameOver = false;

	// new game button
	$('#newgame').click(function () {
		// TODO: check if game not over, warn player

		// reset board
		board = [0,0,0, 0,0,0, 0,0,0];
		$('.xos').text('');
		$('.xos').addClass('selectable');

		// reset gameOver bool
		gameOver = false;

		// swap who starts
		startingPlayer = startingPlayer == player1 ? player2 : player1;

		// if playing compy, and compy is X, make computer move
		if (!multiplayer && startingPlayer == player2) {
			let r = getRandomMove(board, player2);
			board[r.spot] = player2;
			$('#' + r.spot).removeClass('selectable');
			$('#' + r.spot).text(OS);
		}
	});

	// switch single/multiplayer
	$('#multiplayer').click(function () {
		// reset board
		board = [0,0,0, 0,0,0, 0,0,0];
		$('.xos').text('');
		$('.xos').addClass('selectable');

		// reset gameOver bool
		gameOver = false;

		// reset wins and startingPlayer
		p1_wins = 0;
		p2_wins = 0;
		$('#p1_wins').text(0);
		$('#ties').text(0);
		$('#p2_wins').text(0);
		startingPlayer = player1;

		// switch multiplayer on/off
		multiplayer = multiplayer ? false : true;

		// change score labels
		$('#p1_name').text(multiplayer ? 'Player 1' : 'Human');
		$('#p2_name').text(multiplayer ? 'Player 2' : 'Computer');	

		// change icon
		$(this).html('<i class="fa-solid fa-user' + (multiplayer ? '-group' : '') + '"></i>');
		$(this).attr('title', 'Switch to ' + (multiplayer ? 'single ' : 'multi') + 'player');
	});

	// utility function to check and handle game over
	function checkGameOver() {
		// check win
		let w = checkWin(board);
		if (w.result == 1) {
			p1_wins += 1;

			// update text
			$('#p1_wins').text(p1_wins);

			// +1 animation
			$('#p1p1').addClass('slide');
			setTimeout(() => {
				$('#p1p1').removeClass('slide')
			}, 1000);
		} else if (w.result == -1) {
			p2_wins += 1;

			// update scoreboard
			$('#p2_wins').text(p2_wins);

			// +1 animation
			$('#p2p1').addClass('slide');
			setTimeout(() => {
				$('#p2p1').removeClass('slide')
			}, 1000);

			// tictactoe animation
			// w.pattern
		}

		if (w.result != 0) {
			gameOver = true;	
			return;
		}

		// check cat's game
		if (!board.some((e) => e==0)) {
			ties += 1;
			
			// update scoreboard
			$('#ties').text(ties);
			
			// +1 animation
			$('#tp1').addClass('slide');
			setTimeout(() => {
				$('#tp1').removeClass('slide')
			}, 1000);

			gameOver = true;
			return;
		}
	}

	$('.cell').each(function(i) {
		$(this).append(
			// create inner cell and click event
			$('<div>', {'class': 'xos selectable', 'id': i}).click(function () {
				// check if valid
				if (board[this.id] != 0 || gameOver) {
					console.log('Invalid move');
					return;
				}

				// update board
				board[this.id] = currentPlayer;
				$(this).text(currentPlayer==1 ? XS : OS);
				$(this).removeClass('selectable');

				checkGameOver();

				if (gameOver) {
					return;
				}

				// if playing computer, do computer move
				if (!multiplayer) {
					let r = getMinimaxMove(board, player2);
					// let r = getRandomMove(board);
					console.log(r);
					board[r.spot] = player2;
					$('#' + r.spot).removeClass('selectable');
					setTimeout(function () {
						$('#' + r.spot).text(OS);  // computer is always O's
					}, 200);
					console.log(board);

					checkGameOver();
				} else {
					// change players
					currentPlayer = currentPlayer == player1 ? player2 : player1;
				}
			})
		);
	});

});