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

    // Randomly select a shape type
    selectShapeType() {
        const shapes = ['circle', 'triangle', 'rectangle', 'ellipse', 'polygon'];
        const randomIndex = Math.floor(this.random() * shapes.length);
        return shapes[randomIndex];
    }

    // Create circle SVG element
    createCircle(x, y, width, height) {
        const radius = Math.min(width, height) / 2;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        return `<circle cx="${Math.round(centerX)}" cy="${Math.round(centerY)}" r="${Math.round(radius)}" fill="${this.nextColor()}" />`;
    }

    // Create ellipse SVG element
    createEllipse(x, y, width, height) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        return `<ellipse cx="${Math.round(centerX)}" cy="${Math.round(centerY)}" rx="${Math.round(rx)}" ry="${Math.round(ry)}" fill="${this.nextColor()}" />`;
    }

    // Create triangle SVG element
    createTriangle(x, y, width, height) {
        // Three points for the triangle
        const x1 = x + width / 2;
        const y1 = y;
        const x2 = x;
        const y2 = y + height;
        const x3 = x + width;
        const y3 = y + height;
        
        return `<polygon points="${Math.round(x1)},${Math.round(y1)} ${Math.round(x2)},${Math.round(y2)} ${Math.round(x3)},${Math.round(y3)}" fill="${this.nextColor()}" />`;
    }

    // Create rectangle SVG element
    createRectangle(x, y, width, height) {
        return `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(width)}" height="${Math.round(height)}" fill="${this.nextColor()}" />`;
    }

    // Create polygon with 4-7 sides
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

    // Create a shape based on type
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

    generateShapeNoise(width = 100, height = 50, shapeCount = 15) {
        let svgContent = `<svg id="shape-noise-${this.seed}" class="noise" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        
        // Add a background if desired
        svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="#f7f7f7" />`;
        
        // Generate shapes
        for (let i = 0; i < shapeCount; i++) {
            const shapeType = this.selectShapeType();
            
            // Random position and size
            const shapeWidth = 5 + this.random() * (width / 2);
            const shapeHeight = 5 + this.random() * (height / 2);
            const x = this.random() * (width - shapeWidth);
            const y = this.random() * (height - shapeHeight);
            
            svgContent += this.createShape(shapeType, x, y, shapeWidth, shapeHeight);
        }
        
        svgContent += '</svg>';
        return svgContent;
    }

    // Recursive space partitioning approach (similar to original)
    generatePartitionedShapeNoise(width = 100, height = 50, splits = 10, minSplit = 0.25, maxSplit = 0.75) {
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

        let svgContent = `<svg id="shape-noise-${this.seed}" class="noise" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        
        // Assign a random shape to each partition
        for (const rect of rectangles) {
            const shapeType = this.selectShapeType();
            svgContent += this.createShape(shapeType, rect.x, rect.y, rect.width, rect.height);
        }

        svgContent += '</svg>';
        return svgContent;
    }
}

// Usage examples:
// const noise = new ShapeNoise(12345);
// const randomShapes = noise.generateShapeNoise(200, 100, 20);
// const partitionedShapes = noise.generatePartitionedShapeNoise(200, 100, 12);
