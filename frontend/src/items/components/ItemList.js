import React from 'react';

import Card from '../../shared/components/UIElements/Card';
import ItemObject from './ItemObject';
import Button from '../../shared/components/FormElements/Button';
import './ItemList.css';

const ItemList = props => {
  if (props.items.length === 0) {
    return (
      <div className="item-list center">
        <Card>
          <h2>No items found. Maybe create one?</h2>
          <Button to="/items/new">Share Item</Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="item-list">
      {props.items.map(item => (
        <ItemObject
          key={item.id}
          id={item.id}
          image={item.image}
          title={item.title}
          description={item.description}
          price={item.price}
          creatorId={item.creator}
          coordinates={item.location}
          onDelete={props.onDeleteItem}
        />
      ))}
    </ul>
  );
};

export default ItemList;
