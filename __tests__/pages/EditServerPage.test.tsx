/** @jest-environment jsdom */
import React, {useState} from 'react';
import {fireEvent, render} from '@testing-library/react';
import {
  /*addUserServer, */ editUserServer,
} from '../../src/firebase/controlers';
import {useButtonNavigate} from '../../src/hooks';
import EditServerPage /*NAME_PLACEHOLDER*/ from '../../src/pages/EditServerPage';
import {useLocation} from 'react-router-dom';
import {noop} from 'lodash';

jest.mock('../../src/firebase/controlers');
jest.mock('../../src/hooks');
// const buttonRef = {current: {disabled: null}};
jest.mock('../../src/components/Button', () => (props) => (
  // @ts-expect-error
  <mc-button {...props} />
));
jest.spyOn(console, 'error');

describe('EditServerPage', () => {
  const serverToEdit = {
    name: 'aServer',
    address: '123.123.123.123',
    id: 'test-id',
  };
  const editedServer = {
    name: 'a Server',
    address: '321.312.312.312',
    id: 'test-id',
  };

  beforeEach(jest.clearAllMocks);

  it('should render to edit an existing server', () => {
    const mockSetNameState = jest.fn();
    const mockSetAddressState = jest.fn();
    (useLocation as jest.Mock).mockReturnValueOnce({state: serverToEdit});
    (useState as jest.Mock)
      .mockReturnValueOnce([serverToEdit.name, mockSetNameState])
      .mockReturnValueOnce([serverToEdit.address, mockSetAddressState]);

    const {container, getByTestId} = render(<EditServerPage />);

    expect(getByTestId('page-title')).toBeDefined();

    // name
    expect(getByTestId('name-label')).toBeDefined();
    const nameInput = getByTestId('name-input');
    expect(nameInput).toHaveAttribute('value', serverToEdit.name);
    fireEvent.change(nameInput, {target: {value: editedServer.name}});
    // fireEvent.blur(nameInput, {target: {value: 'ABC'}}); // TODO: for new server test
    expect(mockSetNameState).toHaveBeenCalledWith(editedServer.name);

    // address
    expect(getByTestId('address-label')).toBeDefined();
    const addressInput = getByTestId('address-input');
    expect(addressInput).toHaveAttribute('value', serverToEdit.address);
    fireEvent.change(addressInput, {target: {value: editedServer.address}});
    expect(mockSetAddressState).toHaveBeenCalledWith(editedServer.address);

    expect(container).toMatchSnapshot();
  });

  it('should call editUserServer and navigate back when the done button is clicked, and name and address have changed', () => {
    const mockNavigate = jest.fn();
    const mockSetNameState = jest.fn();
    const mockSetAddressState = jest.fn();

    (useLocation as jest.Mock).mockReturnValueOnce({state: serverToEdit});
    (useButtonNavigate as jest.Mock).mockReturnValueOnce(mockNavigate);
    (useState as jest.Mock)
      .mockReturnValueOnce([editedServer.name, mockSetNameState])
      .mockReturnValueOnce([editedServer.address, mockSetAddressState]);
    (editUserServer as jest.Mock).mockImplementationOnce(() => ({
      then: (fn) => fn(),
    }));

    const {getByTestId} = render(<EditServerPage />);

    const doneButton = getByTestId('done-button');
    fireEvent.click(doneButton);
    expect(editUserServer).toHaveBeenCalledWith(editedServer);
    expect(mockNavigate).toBeCalledWith('/mcServerStatus');
  });

  it('should navigate back with no changes made when done button is clicked', () => {
    const mockNavigate = jest.fn();
    const mockThenCall = () => ({
      then: (fn) => fn(),
    });
    // @ts-ignore
    jest.spyOn(Promise, 'resolve').mockImplementation(mockThenCall);
    (useLocation as jest.Mock).mockReturnValueOnce({state: serverToEdit});
    (useButtonNavigate as jest.Mock).mockReturnValueOnce(mockNavigate);
    (useState as jest.Mock)
      .mockReturnValueOnce([serverToEdit.name, noop])
      .mockReturnValueOnce([serverToEdit.address, noop]);
    (editUserServer as jest.Mock).mockImplementationOnce(mockThenCall);

    const {getByTestId} = render(<EditServerPage />);

    const doneButton = getByTestId('done-button');
    fireEvent.click(doneButton);
    expect(editUserServer).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/mcServerStatus');
  });

  test.todo('should render to add a new server');
  test.todo('should place default server name when input name is blank');
  test.todo('should navigate to the landing when cancel is pressed');
});
