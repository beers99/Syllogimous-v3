


function seededRandom(seed) {
    let m = 2 ** 31 - 1; // Large prime number
    let a = 48271;       // Multiplier
    let c = 0;           // Increment
    let state = seed % m;

    return function () {
        state = (a * state + c) % m;
        return state / m; // Normalize to [0, 1)
    };
}

class ShapeNoise {
    constructor(seed) {
        this.random = seededRandom(seed);
        this.seed = seed;
    }

    nextColor() {
        const hue = Math.floor(this.random() * 360);
        const saturation = Math.floor(20 + this.random() * 81);
        const lightness = Math.floor(10 + (this.random() * 91));

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    weightedRandomIndex(array) {
        const totalWeight = array.reduce((acc, _, index) => acc + Math.pow(index + 1, 2), 0);
        const randomWeight = this.random() * totalWeight;

        let cumulativeWeight = 0;
        for (let i = 0; i < array.length; i++) {
            cumulativeWeight += Math.pow(i + 1, 2);
            if (randomWeight < cumulativeWeight) {
                return i;
            }
        }
        return array.length - 1;
    }

    selectShapeType() {
        const shapes = ['circle', 'triangle', 'rectangle', 'ellipse', 'polygon'];
        const randomIndex = Math.floor(this.random() * shapes.length);
        return shapes[randomIndex];
    }

    createCircle(x, y, width, height) {
        const radius = Math.min(width, height) / 2;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        return `<circle cx="${Math.round(centerX)}" cy="${Math.round(centerY)}" r="${Math.round(radius)}" fill="${this.nextColor()}" />`;
    }

    createEllipse(x, y, width, height) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        return `<ellipse cx="${Math.round(centerX)}" cy="${Math.round(centerY)}" rx="${Math.round(rx)}" ry="${Math.round(ry)}" fill="${this.nextColor()}" />`;
    }

    createTriangle(x, y, width, height) {
        const x1 = x + width / 2;
        const y1 = y;
        const x2 = x;
        const y2 = y + height;
        const x3 = x + width;
        const y3 = y + height;
        
        return `<polygon points="${Math.round(x1)},${Math.round(y1)} ${Math.round(x2)},${Math.round(y2)} ${Math.round(x3)},${Math.round(y3)}" fill="${this.nextColor()}" />`;
    }

    createRectangle(x, y, width, height) {
        return `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(width)}" height="${Math.round(height)}" fill="${this.nextColor()}" />`;
    }

    createPolygon(x, y, width, height) {
        const sides = 4 + Math.floor(this.random() * 4); // 4 to 7 sides
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2;
        
        let points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * 2 * Math.PI;
            const pointX = centerX + radius * Math.cos(angle);
            const pointY = centerY + radius * Math.sin(angle);
            points.push(`${Math.round(pointX)},${Math.round(pointY)}`);
        }
        
        return `<polygon points="${points.join(' ')}" fill="${this.nextColor()}" />`;
    }

    createShape(type, x, y, width, height) {
        switch (type) {
            case 'circle':
                return this.createCircle(x, y, width, height);
            case 'triangle':
                return this.createTriangle(x, y, width, height);
            case 'rectangle':
                return this.createRectangle(x, y, width, height);
            case 'ellipse':
                return this.createEllipse(x, y, width, height);
            case 'polygon':
                return this.createPolygon(x, y, width, height);
            default:
                return this.createRectangle(x, y, width, height);
        }
    }

    generateShapeSvg(id, splits, minSplit = 0.25, maxSplit = 0.75) {
        const width = 100, height = 50;
        let rectangles = [{ x: 0, y: 0, width, height }];

        for (let i = 0; i < splits; i++) {
            const [rect] = rectangles.splice(this.weightedRandomIndex(rectangles), 1);
            const splitProbability = rect.height / (rect.width + rect.height);
            const splitHorizontally = this.random() < splitProbability;
            
            if (splitHorizontally) {
                const low = rect.height * minSplit;
                const high = rect.height * maxSplit;
                const splitY = rect.y + low + this.random() * (high - low);
                rectangles.push(
                    { x: rect.x, y: rect.y, width: rect.width, height: splitY - rect.y },
                    { x: rect.x, y: splitY, width: rect.width, height: rect.y + rect.height - splitY }
                );
            } else {
                const low = rect.width * minSplit;
                const high = rect.width * maxSplit;
                const splitX = rect.x + low + this.random() * (high - low);
                rectangles.push(
                    { x: rect.x, y: rect.y, width: splitX - rect.x, height: rect.height },
                    { x: splitX, y: rect.y, width: rect.x + rect.width - splitX, height: rect.height }
                );
            }

            rectangles.sort((a, b) => a.width * a.height - b.width * b.height);
        }

        let svgContent = `<svg id="shape-noise-${id}" class="noise" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        
        for (const rect of rectangles) {
            const shapeType = this.selectShapeType();
            svgContent += this.createShape(shapeType, rect.x, rect.y, rect.width, rect.height);
        }

        svgContent += '</svg>';
        return svgContent;
    }
}

function createNonsenseWord() {
    const vowels = ['A', 'E', 'I', 'O', 'U'], consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    for (string = ''; string.length < savedata.nonsenseWordLength;) {
        if ((string.length + 1) % 2) 
            string += consonants[Math.floor(Math.random() * 21)];
        else 
            string += vowels[Math.floor(Math.random() * 5)];

        if (string.length == savedata.nonsenseWordLength) {
            if (bannedWords.some(d => string.includes(d))) {
                string = '';
            } else {
                return string;
            }
        }
    }
}

function createGarbageWord() {
    const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'];
    let string = '';
    while (string.length < savedata.garbageWordLength) {
        const c = consonants[Math.floor(Math.random() * consonants.length)]
        if (string.length > 0 && string.endsWith(c)) {
            continue;
        }
        string += c;
    }
    return string;
}

let currentJunkEmojiSequence = [0, 3, 6, 9, 1, 4, 7, 2, 5, 8];
let currentJunkEmojiSequenceId = 0;
function createJunkEmoji() {
    const splitSize = Math.floor(JUNK_EMOJI_COUNT / currentJunkEmojiSequence.length);
    const numSplits = JUNK_EMOJI_COUNT / splitSize;
    let offset = currentJunkEmojiSequence[currentJunkEmojiSequenceId] * splitSize;
    const choice = Math.floor(Math.random() * JUNK_EMOJI_COUNT / numSplits);
    const id = offset + choice;
    currentJunkEmojiSequenceId++;
    if (currentJunkEmojiSequenceId >= currentJunkEmojiSequence.length) {
        currentJunkEmojiSequenceId = 0;
    }
    return `[junk]${id}[/junk]`;
}

function createShapeNoiseTag() {
    const id = Math.floor(Math.random() * 999999);
    const splits = savedata.visualNoiseSplits; // Reusing the same setting
    return `[shnoise]${id},${splits}[/shnoise]`;
}

function renderShapeNoise(tag) {
    const match = tag.match(/\[shnoise\](\d+),(\d+)\[\/shnoise\]/);
    if (match) {
        const id = parseInt(match[1]);
        const splits = parseInt(match[2]);
        const noiseGenerator = new ShapeNoise(id);
        return noiseGenerator.generateShapeSvg(id, splits);
    }
    return tag;
}

function maxStimuliAllowed() {
    const stimuliConfigs = createStimuliConfigs();
    return stimuliConfigs.reduce((a, b) => Math.min(a, b.limit), 999) - 1;
}

function createStimuliConfigs() {
    const stimuliConfigs = [];
    if (savedata.useMeaningfulWords && savedata.meaningfulWordNouns) {
        stimuliConfigs.push({
            limit: meaningfulWords.nouns.length,
            generate: () => pickRandomItems(meaningfulWords.nouns, 1).picked[0],
        });
    };
    if (savedata.useMeaningfulWords && savedata.meaningfulWordAdjectives) {
        stimuliConfigs.push({
            limit: meaningfulWords.adjectives.length,
            generate: () => pickRandomItems(meaningfulWords.adjectives, 1).picked[0],
        });
    };
    if (savedata.useEmoji) {
        stimuliConfigs.push({
            limit: emoji.length,
            generate: () => pickRandomItems(emoji, 1).picked[0],
        });
    };
    if (savedata.useJunkEmoji) {
        stimuliConfigs.push({
            limit: JUNK_EMOJI_COUNT,
            generate: () => createJunkEmoji(),
        });
    };
    if (savedata.useVisualNoise) {
        stimuliConfigs.push({
            limit: 1000,
            // Updated to use shape noise
            generate: () => createShapeNoiseTag(),
        });
    };
    if (savedata.useGarbageWords) {
        stimuliConfigs.push({
            limit: 19 ** (savedata.garbageWordLength),
            generate: createGarbageWord,
        });
    };
    if (savedata.useNonsenseWords || stimuliConfigs.length === 0) {
        let limit;
        if (savedata.nonsenseWordLength % 2)
            limit = (20 ** (Math.floor(savedata.nonsenseWordLength / 2) + 1)) * (5 ** Math.floor(savedata.nonsenseWordLength / 2));
        else 
            limit = (20 ** (savedata.nonsenseWordLength / 2)) * (5 ** (savedata.nonsenseWordLength / 2));
        stimuliConfigs.push({
            limit: limit,
            generate: () => createNonsenseWord(),
        });
    };

    stimuliConfigs.forEach(config => config.unique = new Set());
    return stimuliConfigs;
}

function createStimuli(numberOfStimuli, usedStimuli) {
    let stimuliConfigs = createStimuliConfigs();
    shuffle(stimuliConfigs);
    let configIndex = 0;
    const nextConfig = () => {
        const config = stimuliConfigs[configIndex];
        configIndex++;
        if (configIndex >= stimuliConfigs.length) {
            configIndex = 0;
        }
        return config;
    }

    const stimuliCreated = [];
    for (let i = 0; i < numberOfStimuli; i++) {
        let config = nextConfig();
        for (let j = 0; j < 9999 && config.unique.length >= config.limit; j++)
            config = nextConfig();
        let nextStimuli = config.generate();
        for (let j = 0; j < 9999 && config.unique.has(nextStimuli); j++) {
            nextStimuli = config.generate();
        }
        stimuliCreated.push(nextStimuli);
        config.unique.add(nextStimuli);
    }

    shuffle(stimuliCreated);
    return stimuliCreated
}
