
function checkWin(b) {
	let checks = [[0,1,2],[3,4,5],[6,7,8], [0,4,8],
				  [0,3,6],[1,4,7],[2,5,8], [2,4,6]];

	for (let c of checks) {
		r = 0;
		for (let e of c) {
			r += b[e];
		}
		if (Math.abs(r) == 3) {
			return Math.sign(r)
		}
	}
	return 0;
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
	if (check != 0) {
		res.value = check;
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

	var XS = '\u2573';
	var OS = '\u25EF';

	var p1_wins = 0;
	var p2_wins = 0;
	var ties = 0;

	var human = 1;
	var compy = -1;
	var board = [0,0,0, 0,0,0, 0,0,0];
	var gameOver = false;

	// new game button
	$('#newgame').click(function () {
		// TODO: check if game not over, warn player

		// clear board
		board = [0,0,0, 0,0,0, 0,0,0];
		$('.xos').text('');
		$('.xos').addClass('selectable');

		// reset gameOver bool
		gameOver = false;

		// swap players
		let t = human;
		human = compy;
		compy = t;

		// if compy is X, make computer move
		if (compy == 1) {
			let r = getRandomMove(board, compy);
			board[r.spot] = compy;
			$('#' + r.spot).removeClass('selectable');
			$('#' + r.spot).text(compy==1 ? XS : OS);
		}
	});

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
				board[this.id] = human;
				$(this).text(human==1 ? XS : OS);
				$(this).removeClass('selectable');

				// check win
				let w = checkWin(board);
				if (w != 0) {
					p1_wins += 1;
					$('#p1_wins').text(p1_wins);
					gameOver = true;
					return;
				}

				// check cat's game
				if (!board.some((e) => e==0)) {
					ties += 1;
					$('#ties').text(ties);
					gameOver = true;
					return;
				}

				// do computer move
				// let r = getRandomMove(board, compy);
				let r = getMinimaxMove(board, compy);
				board[r.spot] = compy;
				$('#' + r.spot).removeClass('selectable');
				setTimeout(function () {
					$('#' + r.spot).text(compy==1 ? XS : OS);
				}, 200);

				// check win
				w = checkWin(board);
				if (w != 0) {
					p2_wins += 1;
					setTimeout(function () {
						$('#p2_wins').text(p2_wins);
					}, 400);
					gameOver = true;
					return;
				}

				// check cat's game
				if (!board.some((e) => e==0)) {
					ties += 1;
					$('#ties').text(ties);
					gameOver = true;
					return;
				}
			})
		);
	});

});