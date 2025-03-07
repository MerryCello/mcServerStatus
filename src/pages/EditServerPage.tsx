import React, {
  ChangeEventHandler,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useLocation} from 'react-router-dom';
import {isNil} from 'lodash';
import Button from '../components/Button';
import {addUserServer, editUserServer} from '../firebase/controlers';
import {useButtonNavigate} from '../hooks';

export const NAME_PLACEHOLDER = 'Minecraft Server';
export type EditRouteLocation = {
  state: {
    id?: string;
    name?: string;
    address?: string;
    listId?: string;
  };
};

const EditServerPage: FC = () => {
  const {state: routeParams}: EditRouteLocation = useLocation();
  const navigate = useButtonNavigate();
  const [nameState, setNameState] = useState(
    routeParams?.name ?? NAME_PLACEHOLDER,
  );
  const [addressState, setAddressState] = useState(routeParams?.address ?? '');
  const doneRef = useRef<{disabled: boolean | null}>(null);

  useEffect(() => {
    if (doneRef.current) {
      doneRef.current.disabled = addressState === '';
    }
  }, []);

  const nameInputOnChange: ChangeEventHandler<HTMLInputElement> = ({
    target: input,
  }) => {
    setNameState(input.value);
  };
  const addressInputOnChange: ChangeEventHandler<HTMLInputElement> = ({
    target: input,
  }) => {
    setAddressState(input.value);
    if (doneRef.current) {
      if (input.value !== '') {
        doneRef.current.disabled = false;
      } else {
        doneRef.current.disabled = true;
      }
    }
  };

  const nameInputOnBlur = () => {
    if (nameState === '') setNameState(NAME_PLACEHOLDER);
  };

  const goBack = () => navigate(-1);

  const doneOnClick = () => {
    let resolution = Promise.resolve();
    const aNewServerIsAdded =
      isNil(routeParams?.name) &&
      isNil(routeParams?.address) &&
      isNil(routeParams?.id);
    const anInputFieldHasChanged =
      routeParams?.address !== addressState || routeParams?.name !== nameState;

    if (aNewServerIsAdded) {
      resolution = addUserServer(
        {
          address: addressState,
          name: nameState,
        },
        undefined,
        routeParams?.listId,
      );
    } else if (anInputFieldHasChanged) {
      resolution = editUserServer(
        {
          id: routeParams?.id,
          address: addressState,
          name: nameState,
        },
        undefined,
        routeParams?.listId,
      );
    }
    resolution.then(goBack);
  };

  return (
    <div className='main-container edit-page-container'>
      <h1 data-testid='page-title'>{'Edit Server Info'}</h1>
      <div className='edit-form-container column'>
        <div className='inputs column'>
          <label data-testid='name-label'>{'Server Name'}</label>
          <input
            data-testid='name-input'
            type={'text'}
            tabIndex={1}
            autoFocus
            onChange={nameInputOnChange}
            onBlur={nameInputOnBlur}
            value={nameState}
          />
          <label data-testid='address-label'>{'Server Address'}</label>
          <input
            data-testid='address-input'
            type={'text'}
            tabIndex={2}
            value={addressState}
            onChange={addressInputOnChange}
          />
        </div>
        <div className='buttons column'>
          <Button
            data-testid='done-button'
            onClick={doneOnClick}
            tabIndex={3}
            ref={doneRef}>
            {'Done'}
          </Button>
          <Button data-testid='cancel-button' onClick={goBack} tabIndex={4}>
            {'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditServerPage;
