import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ItemList from '../components/ItemList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserItems = () => {
  const [loadedItems, setLoadedItems] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/items/user/${userId}`
        );
        setLoadedItems(responseData.items);
      } catch (err) {}
    };
    fetchItems();
  }, [sendRequest, userId]);

  const itemDeletedHandler = deletedItemId => {
    setLoadedItems(prevItems =>
      prevItems.filter(item => item.id !== deletedItemId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedItems && (
        <ItemList items={loadedItems} onDeleteItem={itemDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default UserItems;
