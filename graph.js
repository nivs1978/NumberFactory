class Graph {
    updateBeltItems(beltSegment, deltaTime, speed) {
        for (let item of beltSegment.items) {
            item.position += (deltaTime * speed) / beltSegment.length;
            if (item.position >= 1.0) {
                // Handle item reaching the end of the segment
                item.position = 1.0;
                // Transfer to the next segment or process the item
            }
        }
        // Remove items that have reached the end if they are processed
        beltSegment.items = beltSegment.items.filter(item => item.position < 1.0);
    }

    transferItemToNextSegment(item, nextSegment) {
        if (nextSegment.items.length < nextSegment.length) {
            item.position = 0.0; // Reset position for the new segment
            nextSegment.items.push(item);
        } else {
            // Handle case where the next segment is full (e.g., pause the item)
        }
    }

    placeBeltSegment(start, end, direction) {
        const segment = new BeltSegment(start, end, direction);
        // Update the grid to reflect the new belt segment
        // Ensure no overlap or invalid placement
        // Add the segment to your belt management system
    }

    renderBeltItems(ctx, beltSegment, cellSize) {
        for (let item of beltSegment.items) {
            let x = beltSegment.start.x * cellSize;
            let y = beltSegment.start.y * cellSize;

            if (beltSegment.direction === "horizontal") {
                x += item.position * beltSegment.length * cellSize;
            } else if (beltSegment.direction === "vertical") {
                y += item.position * beltSegment.length * cellSize;
            }

            // Draw the item (e.g., as a rectangle or image)
            ctx.fillStyle = 'blue'; // Example color
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}