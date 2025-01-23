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

const EditServerPage: FC = () => {
  const {state: routeParam} = useLocation();
  const navigate = useButtonNavigate();
  const [nameState, setNameState] = useState(
    routeParam?.name ?? NAME_PLACEHOLDER,
  );
  const [addressState, setAddressState] = useState(routeParam?.address ?? '');
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

  const doneOnClick = () => {
    let resolution = Promise.resolve();
    const aNewServerIsAdded = isNil(routeParam);
    const anInputFieldHasChanged =
      routeParam?.address !== addressState || routeParam?.name !== nameState;

    if (aNewServerIsAdded) {
      resolution = addUserServer({
        address: addressState,
        name: nameState,
      });
    } else if (anInputFieldHasChanged) {
      resolution = editUserServer({
        id: routeParam?.id,
        address: addressState,
        name: nameState,
      });
    }
    resolution.then(() => navigate('/mcServerStatus'));
  };

  return (
    <div className='main-container edit-page-container'>
      <h1 data-testid='page-title'>Edit Server Info</h1>
      <div className='edit-form-container column'>
        <div className='inputs column'>
          <label data-testid='name-label'>Server Name</label>
          <input
            data-testid='name-input'
            type={'text'}
            tabIndex={1}
            autoFocus
            onChange={nameInputOnChange}
            onBlur={nameInputOnBlur}
            value={nameState}
          />
          <label data-testid='address-label'>Server Address</label>
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
            Done
          </Button>
          <Button
            data-testid='cancel-button'
            linkTo={'/mcServerStatus'}
            tabIndex={4}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditServerPage;
