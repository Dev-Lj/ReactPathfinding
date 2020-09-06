class Node {
  #xPos;
  #yPos;
  #distanceToStartNode = Infinity;
  #lastNode;
  #isVisited = false;
  #isTargetNode = false;
  #isWall = false;

  constructor(xPos, yPos) {
    this.#xPos = xPos;
    this.#yPos = yPos;
  }

  setDistanceToStartNode(distance) {
    this.#distanceToStartNode = distance;
  }

  getDistanceToStartNode() {
    return this.#distanceToStartNode;
  }

  setTargetNode() {
    this.#isTargetNode = true;
  }

  isTargetNode() {
    return this.#isTargetNode;
  }

  setIsWall() {
    this.#isWall = true;
  }

  isWall() {
    return this.#isWall;
  }

  setVisited() {
    this.#isVisited = true;
  }

  isVisited() {
    return this.#isVisited;
  }

  getXPos() {
    return this.#xPos;
  }

  getYPos() {
    return this.#yPos;
  }

  setLastNode(lastNode) {
    this.#lastNode = lastNode;
  }

  getLastNode() {
    return this.#lastNode;
  }
}

export default Node;
