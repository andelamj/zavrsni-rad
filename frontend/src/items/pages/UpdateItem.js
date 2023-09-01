import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './ItemForm.css';

const UpdateItem = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedItem, setLoadedItem] = useState();
  const itemId = useParams().itemId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      price: {
        value: '',
        isValid: false
      }
    },
    false
  );

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/items/${itemId}`
        );
        setLoadedItem(responseData.item);
        setFormData(
          {
            title: {
              value: responseData.item.title,
              isValid: true
            },
            description: {
              value: responseData.item.description,
              isValid: true
            },
            price: {
              value: responseData.item.price,
              isValid: false
            }
          },
          true
        );

      } catch (err) {}
    };
    fetchItem();
  }, [sendRequest, itemId, setFormData]);

  const itemUpdateSubmitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/items/${itemId}`,
        'PATCH',
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
          price: formState.inputs.price.value
        }),
        {
          'Content-Type': 'application/json'
        }
      );
      history.push('/' + auth.userId + '/items');
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedItem && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find item!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedItem && (
        <form className="item-form" onSubmit={itemUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedItem.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 characters)."
            onInput={inputHandler}
            initialValue={loadedItem.description}
            initialValid={true}
          />
          <Input
            id="price"
            element="input"
            label="Price"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid address."
            onInput={inputHandler}
            initialValue={loadedItem.price}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE ITEM
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdateItem;
