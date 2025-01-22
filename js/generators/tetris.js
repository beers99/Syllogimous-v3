  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 20;
  const JUNK_TETROMINO_COUNT = 1000;
  const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;
  
  //The Tetrominoes
  const lTetromino = [
    [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, 2],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 2],
    [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 2],
    [GRID_WIDTH, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1, GRID_WIDTH * 2 + 2]
  ];

  const zTetromino = [
    [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
    [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1],
    [0, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1],
    [GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2, GRID_WIDTH * 2 + 1]
  ];

  const tTetromino = [
    [1, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2],
    [1, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 1],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH * 2 + 1],
    [1, GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1]
  ];

  const oTetromino = [
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1],
    [0, 1, GRID_WIDTH, GRID_WIDTH + 1]
  ];

  const iTetromino = [
    [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 3 + 1],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH + 3],
    [1, GRID_WIDTH + 1, GRID_WIDTH * 2 + 1, GRID_WIDTH * 3 + 1],
    [GRID_WIDTH, GRID_WIDTH + 1, GRID_WIDTH + 2, GRID_WIDTH + 3]
  ];

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
  
  theTetrominoes() {
        let s = '<svg style="display: none;">\n';
        s += '<defs>\n';
        for (let i = 0; i < JUNK_TETROMINO_COUNT; i++) {
            const svg = this.theTetrominoes(i);
            s += svg + '\n';
        }
        s += '</defs>\n';
        s += '</svg>\n';
        return s;
    }
    
    function renderTetrominoText(text) {
    text = text.replaceAll(/\[junk\](\d+)\[\/junk\]/gi, (match, id) => {
        let s = `<svg class="junk" width="${GRID_WIDTH}" height="${GRID_WIDTH}">`;
        s += `<use xlink:href="#junk-${id}"></use>`;
        s += '</svg>';
        return s;
    });


  //Randomly Select Tetromino
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];
  
  function renderTetrominoes(question) {
    question = structuredClone(question);
    if (question.bucket) {
        question.bucket = question.bucket.map(renderTetrominoText);
    }

    if (question.buckets) {
        question.buckets = question.buckets.map(bucket => bucket.map(renderTetrominoText));
    }

    if (question.wordCoordMap) {
        const words = Object.keys(question.wordCoordMap);
        for (const word of words) {
            const rendered = renderTetrominoText(word);
            if (rendered.length !== word.length) {
                question.wordCoordMap[rendered] = question.wordCoordMap[word];
                delete question.wordCoordMap[word];
            }
        }
    }

    if (question.subresults) {
        question.subresults = question.subresults.map(renderTetrominoes);
    }

    if (question.premises) {
        question.premises = question.premises.map(renderTetrominoText);
    }

    if (question.operations) {
        question.operations = question.operations.map(renderTetrominoText);
    }

    if (question.conclusion) {
        question.conclusion = renderTetrominoText(question.conclusion);
    }

    return question;
}
