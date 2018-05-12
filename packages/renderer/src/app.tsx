import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IUIState } from './store';


const mapStateToProps = (state: IUIState) => ({
  hoveredCell: state.hoveredCell,
  selectedCells: state.selectedCells,
  entitiesMap: state.entitiesMap,
});

const Stats = connect(mapStateToProps)(({
  hoveredCell,
  selectedCells,
  entitiesMap,
}) => {
  return (
    <div style={{ color: 'white' }}>
      Hovered: {hoveredCell ? `(${hoveredCell.x}, ${hoveredCell.y})` : 'none'}
      {selectedCells.map((cell) => {
        const entities = entitiesMap.get(cell);
        return (
          <div key={cell.hashCode()}>
            Cell: ({cell.get('y')}, {cell.get('y')})<br />
            Entities: {entities.count()}
          </div>
        );
      })}
    </div>
  );
});
Stats.displayName = 'Stats';

export default class App extends Component {
  public render() {
    return (
      <div>
        <Stats />
      </div>
    );
  }
}
