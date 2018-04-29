import React, { Component } from 'react';
import { connect } from 'react-redux';
import { UIState } from './store';


const mapStateToProps = (state: UIState) => ({
  hoveredCell: state.hoveredCell,
  selectedCells: state.selectedCells,
});

const Stats = connect(mapStateToProps)(({ hoveredCell, selectedCells }) => {
  return (
    <div style={{ color: 'white' }}>
      Hovered: {hoveredCell ? `(${hoveredCell.x}, ${hoveredCell.y})` : 'none'}
      <br />
      Selected: {selectedCells.map(cell => `(${cell.x}, ${cell.y})`).join(', ')}
    </div>
  );
});


export default class App extends Component {
  render() {
    return (
      <div>
        <Stats />
      </div>
    );
  }
}
