import React from "react";
import "./NodeVisual.css";

export const CLICKMODE = {
  START: "start",
  TARGET: "target",
  WALL: "wall",
};

export class NodeVisual extends React.Component {
  getCoordinates() {
    return this.props.coordinates;
  }

  render() {
    let conditionalNodeStyle = "";
    if (this.props.isTargetNode) {
      conditionalNodeStyle = "target";
    } else if (this.props.isStartNode) {
      conditionalNodeStyle = "start";
    } else if (this.props.isWallNode) {
      conditionalNodeStyle = "wall";
    } else if (this.props.isWay) {
      conditionalNodeStyle = "way";
    } else if (this.props.isVisited) {
      conditionalNodeStyle = "visited";
    }
    return (
      <div
        className={"node border " + conditionalNodeStyle}
        onClick={() => {
          if (this.props.nodeClicked) {
            this.props.nodeClicked(this);
          }
        }}
        onMouseOver={(e) => {
          if (e.buttons === 1) {
            this.props.nodeClicked(this);
          }
        }}
      ></div>
    );
  }
}

export default NodeVisual;
