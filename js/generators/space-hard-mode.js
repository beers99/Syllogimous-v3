class SpaceHardMode {
    constructor(numTransforms) {
        this.numTransforms = numTransforms;
    }
    
    basicHardMode(wordCoordMap, startWord, endWord, originalConclusionCoord) {
        let newWordMap;
        let newDiffCoord;
        let newConclusionCoord;
        let operations;
        let usedDimensions;
        const demandClose = Math.random() > 0.4;
        const demandChange = Math.random() > 0.2;
        let closeTries = 10;
        let changeTries = 10;
        for (let i = 0; i < 10000; i++) {
            newWordMap = structuredClone(wordCoordMap);
            [operations, usedDimensions] = this.applyHardMode(newWordMap, startWord, endWord);
            [newDiffCoord, newConclusionCoord] = getConclusionCoords(newWordMap, startWord, endWord);
            if (newConclusionCoord.slice(0, 3).every(c => c === 0)) {
                continue;
            }
            const distance = newDiffCoord.map(Math.abs).reduce((a, b) => a + b);
            const distanceLimit = Math.max(3, Math.floor(Object.keys(newWordMap).length / 2));
            const isClose = distance < distanceLimit;
            if (demandClose && !isClose && closeTries > 0) {
                closeTries--;
                continue;
            }
            const isChanged = !arraysEqual(originalConclusionCoord, newConclusionCoord);
            if (demandChange && !isChanged && changeTries > 0) {
                changeTries--;
                continue;
            }
            break;
        }
        return [newWordMap, operations, usedDimensions];
    }

    oneTransform(wordCoordMap, movingWord, dimension, backupDimension) {
        const demandChange = Math.random() < 0.92;
        let changeTries = 8;
        let backupTries = 8;
        let useBackup = false;

        let operation;
        let newWordMap;
        let pool = Object.keys(wordCoordMap).filter(w => w !== movingWord);
        let originalCoord = wordCoordMap[movingWord];
        for (let i = 0; i < 100; i++) {
            newWordMap = structuredClone(wordCoordMap);
            let axisWord = pickRandomItems(pool, 1).picked[0];
            [operation,] = this.applyChain(newWordMap, [], [[[axisWord, movingWord], useBackup ? backupDimension : dimension]]);
            let newCoord = newWordMap[movingWord];
            if (demandChange && changeTries > 0 && arraysEqual(originalCoord, newCoord)) {
                changeTries--;
                if (changeTries === 0) {
                    useBackup = true;
                }
                continue;
            }

            if (demandChange && useBackup && backupTries > 0 && arraysEqual(originalCoord, newCoord)) {
                backupTries--;
                continue;
            }
            break;
        }

        return [newWordMap, operation];
    }

    applyHardMode(wordCoordMap, leftStart, rightStart) {
        const [leftChains, rightChains] = this.createChains(wordCoordMap, leftStart, rightStart);
        const dimensionsUsed = [...leftChains.map(([words, dimension]) => dimension), ...rightChains.map(([words, dimension]) => dimension)];
        const leftOperations = this.applyChain(wordCoordMap, dimensionsUsed, leftChains);
        const rightOperations = this.applyChain(wordCoordMap, dimensionsUsed, rightChains);
        return [[...leftOperations, ...rightOperations], dimensionsUsed];
    }

    createChains(wordCoordMap, leftStart, rightStart) {
        let leftChains = [];
        let rightChains = [];
        let leftDimensions = [];
        let rightDimensions = [];

        const bannedFromPool = new Set([leftStart, rightStart]);
        const pool = Object.keys(wordCoordMap).filter(word => !bannedFromPool.has(word));
        const dimensionPool = wordCoordMap[leftStart].map((c, i) => i);

        let wordSequence = repeatArrayUntil(shuffle(pool.slice()), this.numTransforms);
        let count = 0;
        while (wordSequence.length > 0 && count < 100) {
            let chainSize = Math.min(wordSequence.length, pickRandomItems([1, 1, 2, 2, 3], 1).picked[0]);
            let willUseAllTransforms = chainSize == wordSequence.length && leftChains.length == 0 && rightChains.length == 0;
            let shouldNotChain = pool.length == 1 || (willUseAllTransforms && Math.random() < 0.4)
            if (shouldNotChain)
                chainSize = 1;
            let words = wordSequence.splice(0, chainSize);
            if (coinFlip()) {
                leftChains.push(this.directionize(words, leftStart, leftDimensions, rightDimensions, dimensionPool, wordCoordMap));
                leftDimensions.push(leftChains[leftChains.length - 1][1]);
            } else {
                rightChains.push(this.directionize(words, rightStart, rightDimensions, leftDimensions, dimensionPool, wordCoordMap));
                rightDimensions.push(rightChains[rightChains.length - 1][1]);
            }
            count++;
        }

        return [leftChains, rightChains];
    }

    directionize(words, start, usedDimensions, otherDimensions, dimensionPool, wordCoordMap) {
        let chainWords = words.slice();
        chainWords.push(start);

        let allShifts = dimensionPool.map(c => 0);
        pairwise(chainWords, (a, b) => {
            allShifts = addCoords(allShifts, normalize(diffCoords(wordCoordMap[a], wordCoordMap[b])).map(c => Math.abs(c)));
        })

        const lastUsed = usedDimensions.length > 0 ? usedDimensions[usedDimensions.length - 1] : -1;
        const lastOther = otherDimensions.length > 0 ? otherDimensions[otherDimensions.length - 1] : -1;
        const noLastUsed = dimensionPool.filter((v, i) => i !== lastUsed);
        const noLastOther = noLastUsed.filter((v, i) => i !== lastOther);

        const pool = new Set(noLastOther.length > 0 ? noLastOther : noLastUsed);
        const available = allShifts.map((v, i) => [v, i]).filter(([v, i]) => pool.has(i));
        shuffle(available);
        const sorted = available.sort((a, b) => b[0] - a[0]);
        if (Math.random() < 0.95) {
            return [chainWords, sorted[0][1]];
        } else {
            return [chainWords, pickRandomItems(sorted, 1).picked[0][1]];
        }
    }

    applyChain(wordCoordMap, dimensionsUsed, chains) {
        if (chains.length === 0) {
            return [];
        }

        const mirrorPoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            const diff = p2[index] - p1[index];
            const newPoint = p2.slice();
            newPoint[index] = p1[index] - diff;
            operations.push(createMirrorTemplate(a, b, dimensionNames[index]));
            return newPoint;
        }

        const setPoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            const newPoint = p2.slice();
            newPoint[index] = p1[index];
            operations.push(createSetTemplate(a, b, dimensionNames[index]));
            return newPoint;
        }

        const scalePoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            const diff = p2[index] - p1[index];
            const newPoint = p2.slice();
            const magnifier = 2;
            operations.push(createScaleTemplate(a, b, dimensionNames[index], magnifier));
            newPoint[index] = p1[index] + magnifier * diff;
            return newPoint;
        }

        const rotatePoint = (a, b, index) => {
            const p1 = wordCoordMap[a];
            const p2 = wordCoordMap[b];
            const dimensionPool = p1.map((p, i) => i).slice(0, 3) // Do not include time dimension;
            const plane = pickRandomItems(dimensionPool, 2).picked;
            plane.sort();
            let [m, n] = plane;
            dimensionsUsed.push.apply(dimensionsUsed, plane.filter(d => dimensionsUsed.indexOf(d) == -1));
            if (m === 0 && n === 2) {
                // ZX matches the right-hand rule for rotation, XZ (the reverse) does not
                [m, n] = [n, m];
            }
            const planeName = dimensionNames[m] + dimensionNames[n];
            const planeOp = (dimensionPool.length === 2) ? 'rotated' : (`<span class="highlight">${planeName}</span>-rotated`);
            let newPoint = p2.slice();
            let diffM = p2[m] - p1[m];
            let diffN = p2[n] - p1[n];
            newPoint[m] -= diffM;
            newPoint[n] -= diffN;
            if (coinFlip()) {
                newPoint[m] += diffN
                newPoint[n] += -diffM
                operations.push(createRotationTemplate(a, b, planeOp, `<span class="pos-degree">90°↷</span>`));
            } else {
                newPoint[m] += -diffN
                newPoint[n] += diffM
                operations.push(createRotationTemplate(a, b, planeOp, `<span class="neg-degree">-90°↺</span>`));
            }
            return newPoint;
        }

        const customizeCommands = (pool) => {
            let newPool = pool.filter(command => {
                if (command === setPoint && savedata.enableTransformSet) {
                    return true;
                } else if (command === mirrorPoint && savedata.enableTransformMirror) {
                    return true;
                } else if (command === scalePoint && savedata.enableTransformScale) {
                    return true;
                } else if (command === rotatePoint && savedata.enableTransformRotate) {
                    return true;
                } else {
                    return false;
                }
            });

            if (newPool.length === 0) {
                return [mirrorPoint];
            }

            return newPool;
        }

        let operations = [];
        let starterCommandPool = customizeCommands([setPoint, mirrorPoint, scalePoint, rotatePoint]);
        let commandPool = customizeCommands([mirrorPoint, mirrorPoint, mirrorPoint, scalePoint, scalePoint, rotatePoint, rotatePoint]);
        let usedCommands = [];

        let count = 0;
        let cpool = starterCommandPool;
        for (const [chain, dimension] of chains) {
            for (let i = 1; i < chain.length; i++) {
                const a = chain[i-1];
                const b = chain[i];
                const lastUsed = usedCommands?.[usedCommands.length - 1];
                const filteredPool = cpool.filter(c => c !== lastUsed);
                if (filteredPool.length !== 0) {
                    cpool = filteredPool;
                }

                const command = pickRandomItems(cpool, 1).picked[0];
                wordCoordMap[b] = command.call(null, a, b, dimension);
                usedCommands.push(command);
                cpool = commandPool;
            }
        }
        return operations;
    }

}

function createMirrorTemplate(a, b, dimension) {
    return `<span class="subject">${b}</span> is <span class="highlight">${dimension}</span>-mirrored across <span class="subject">${a}</span>`;
}
function createScaleTemplate(a, b, dimension, scale) {
    return ` <span class="subject">${b}</span> is <span class="highlight">${dimension}</span>-scaled <span class="highlight">${scale}×</span> from <span class="subject">${a}</span>`;
}
function createSetTemplate(a, b, dimension) {
    return `<span class="highlight">${dimension}</span> of <span class="subject">${b}</span> is set to <span class="highlight">${dimension}</span> of <span class="subject">${a}</span>`;
}
function createShiftTemplate(word, direction, shift) {
    return `<span class="subject">${word}</span> is moved ${direction} by <span class="highlight">${shift}</span>`;
}
function createRotationTemplate(a, b, planeOp, degree) {
    return `<span class="subject">${b}</span> is ${planeOp} ${degree} around <span class="subject">${a}</span>`
}
