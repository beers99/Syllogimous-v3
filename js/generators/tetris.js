  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 20;
  const JUNK_TETROMINO_COUNT = 1000;
  const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;
  
  class Tetrominoes {
    constructor() {
        this.id = 0;
        this.pool = Tetrominoes.generateColorPool();
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
        }
        return array;
    }

    static zipShuffle(arrays) {
        const maxLength = Math.max(...arrays.map(arr => arr.length));
    
        const result = [];
        for (let i = 0; i < maxLength; i++) {
            const group = arrays.map(arr => arr[i] !== undefined ? arr[i] : undefined); // Handle different array lengths
            Tetrominoes.shuffleArray(group);
            result.push(group);
        }
    
        return result.flat();
    }

    static generateColorPool() {
        const colors = [];

        const hueGroups = [];
        const hues = [0,10,20,30,40,45,50,55,60,65,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,295,300,305,310,320,330,340,350];
        const saturations = [5, 30, 40, 50, 65, 75, 80, 85, 90, 95, 100];
        const lightnesses = [10, 22, 35, 50, 65, 80, 95];

        for (const hue of hues) {
            const group = [];
            for (const saturation of saturations) {
                for (const lightness of lightnesses) {
                    group.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
                }
            }
            hueGroups.push(group);
        }

        for (const group of hueGroups) {
            Tetrominoes.shuffleArray(group);
        }

        return Tetrominoes.zipShuffle(hueGroups);
    }

    static generateRandomPoints(minX, maxX, minY, maxY, numPoints, minDistance) {
        const points = [];
        const width = maxX - minX;
        const height = maxY - minY;

        const isFarEnough = (x, y) => {
            for (const [px, py] of points) {
                const dx = px - x;
                const dy = py - y;
                if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
                    return false;
                }
            }
            return true;
        };

        while (points.length < numPoints) {
            const x = minX + Math.random() * width;
            const y = minY + Math.random() * height;

            if (isFarEnough(x, y)) {
                points.push([x, y]);
            }
        }

        return points;
    }

    rebuildPool() {
        this.pool = JunkEmojis.generateColorPool();
    }

    nextColor() {
        const color = this.pool[this.id % this.pool.length];
        this.id += 1;
        if (this.id % this.pool.length == 0) {
            this.rebuildPool();
        }
        return color;
    }
  
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
