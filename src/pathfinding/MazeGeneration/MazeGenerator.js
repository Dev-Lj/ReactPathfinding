import { NODEMODE } from "../GridVisualization/NodeVisual";

const DIRECTION_Y = 0;
const DIRECTION_X = 1;

/**
 * Generate random number INCLUDING min and max excluding excepts
 * @param {Number} min
 * @param {Number} max
 * @param {Array} excepts
 */
function generateRndNumber(min, max, excepts = []) {
  if (excepts.length > max - min) {
    // No more available numbers with given exceptions
    throw new Error("No possible number with given excepts");
  }
  var number = Math.floor(Math.random() * (max - min + 1) + min);
  if (excepts.includes(number)) {
    return generateRndNumber(min, max, excepts);
  } else {
    return number;
  }
}

/**
 * Raw concept based on maze generation described in this blog:
 * http://weblog.jamisbuck.org/2011/1/12/maze-generation-recursive-division-algorithm
 */
class MazeGenerator {
  /**
   * Function to call to start recursive maze generation
   * @param {Array} grid
   * @returns {Array} instructions to draw walls
   */
  generateMaze(grid) {
    return this.doMazeGenerationStep(
      grid,
      DIRECTION_Y,
      0,
      0,
      grid[0].length - 1,
      grid.length - 1,
      [],
      []
    );
  }
  /**
   * Get relevant tiles to avoid for given square
   * @param {Array} redZones
   * @param {Number} xFrom
   * @param {Number} yFrom
   * @param {Number} xTo
   * @param {Number} yTo
   * @param {Number} wallDirection
   * @returns {Array} Array of Numbers to avoid for Wall generation
   */
  getRelevantRedzones(redZones, xFrom, yFrom, xTo, yTo, wallDirection) {
    let relevantRedzones = redZones.filter((redZone) => {
      return (
        redZone.y >= yFrom &&
        redZone.y <= yTo &&
        redZone.x >= xFrom &&
        redZone.x <= xTo
      );
    });
    relevantRedzones = relevantRedzones.map((redZone) =>
      wallDirection === DIRECTION_X ? redZone.y : redZone.x
    );
    return [...new Set(relevantRedzones)];
  }

  /**
   * Do recursive step to go down tree of maze
   * @param {Array} grid
   * @param {Number} wallDirection
   * @param {Number} xFrom X-Coordinate of first tile in square
   * @param {Number} yFrom Y-Coordinate of first tile in square
   * @param {Number} xTo X-Coordinate of last tile in square
   * @param {Number} yTo Y-Coordinate of last tile in squre
   * @param {Array} instructions
   * @param {Array} redZones Array of tiles to avoid to not clog maze
   * @returns {Array} instructions for current level of tree
   */
  doMazeGenerationStep(
    grid,
    wallDirection,
    xFrom,
    yFrom,
    xTo,
    yTo,
    instructions,
    redZones
  ) {
    //Check if current square is large enough to draw wall
    if (yTo - yFrom >= 2 && xTo - xFrom >= 2) {
      var wallCoordinate;
      var holePos;

      if (wallDirection === DIRECTION_X) {
        let excepts = this.getRelevantRedzones(
          redZones,
          xFrom,
          yFrom + 1,
          xTo,
          yTo - 1,
          wallDirection
        );
        try {
          wallCoordinate = generateRndNumber(yFrom + 1, yTo - 1, excepts);
        } catch {
          // No wallcoordinate available with given exceptions -> bottom of tree reached
          return instructions;
        }
        holePos = generateRndNumber(xFrom, xTo);
        redZones.push({ x: holePos, y: wallCoordinate - 1 });
        redZones.push({ x: holePos, y: wallCoordinate + 1 });
      } else {
        let excepts = this.getRelevantRedzones(
          redZones,
          xFrom + 1,
          yFrom,
          xTo - 1,
          yTo,
          wallDirection
        );
        try {
          wallCoordinate = generateRndNumber(xFrom + 1, xTo - 1, excepts);
        } catch {
          // No wallcoordinate available with given exceptions -> bottom of tree reached
          return instructions;
        }
        holePos = generateRndNumber(yFrom, yTo);
        redZones.push({ x: wallCoordinate - 1, y: holePos });
        redZones.push({ x: wallCoordinate + 1, y: holePos });
      }

      instructions.push({
        wallDirection,
        wallCoordinate,
        holePos,
        from: wallDirection === DIRECTION_Y ? yFrom : xFrom,
        to: wallDirection === DIRECTION_Y ? yTo : xTo,
      });
      //Follow branch of child 1
      instructions = this.doMazeGenerationStep(
        grid,
        wallDirection === DIRECTION_Y ? DIRECTION_X : DIRECTION_Y,
        xFrom,
        yFrom,
        wallDirection === DIRECTION_Y ? wallCoordinate - 1 : xTo,
        wallDirection === DIRECTION_X ? wallCoordinate - 1 : yTo,
        instructions,
        redZones
      );
      //Follow branch of child 2
      instructions = this.doMazeGenerationStep(
        grid,
        wallDirection === DIRECTION_Y ? DIRECTION_X : DIRECTION_Y,
        wallDirection === DIRECTION_Y ? wallCoordinate + 1 : xFrom,
        wallDirection === DIRECTION_X ? wallCoordinate + 1 : yFrom,
        xTo,
        yTo,
        instructions,
        redZones
      );
    }
    return instructions;
    // Bottom of tree reached
  }

  /**
   * Draw wall with given instructions
   * @param {Array} grid
   * @param {Number} wallDirection
   * @param {Number} wallCoordinate
   * @param {Number} holePos
   * @param {Number} from First tile of wall (including)
   * @param {Number} to  Last tile of wall (including)
   */
  drawWall(grid, wallDirection, wallCoordinate, holePos, from, to) {
    var walls = [];
    if (wallDirection === DIRECTION_X) {
      // Draw wall in x direction accross piece to separate
      for (let xPos = from; xPos <= to; xPos++) {
        if (xPos !== holePos) {
          grid[wallCoordinate][xPos].mode = NODEMODE.WALL;
          walls.push(grid[wallCoordinate][xPos]);
        }
      }
    } else {
      // Draw wall in y direction accross piece to separate
      for (let yPos = from; yPos <= to; yPos++) {
        if (yPos !== holePos) {
          grid[yPos][wallCoordinate].mode = NODEMODE.WALL;
          walls.push(grid[yPos][wallCoordinate]);
        }
      }
    }
    return walls;
  }
}

export default MazeGenerator;
