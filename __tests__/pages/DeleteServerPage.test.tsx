/** @jest-environment jsdom */
import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react';
import DeleteServerPage from '../../src/pages/DeleteServerPage';
import {deleteUserServer} from '../../src/firebase/controlers';
import {useButtonNavigate} from '../../src/hooks';
import {useLocation} from 'react-router-dom';

jest.mock('../../src/firebase/controlers', () => ({
  deleteUserServer: jest.fn(),
}));
jest.mock('../../src/hooks', () => ({
  useButtonNavigate: jest.fn(),
}));

describe('DeleteServerPage', () => {
  const mockNavigate = jest.fn();
  const mockDeleteUserServer = deleteUserServer as jest.Mock;
  const mockUseLocation = useLocation as jest.Mock;

  beforeEach(() => {
    (useButtonNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders delete confirmation message', () => {
    mockUseLocation.mockReturnValue({
      state: {name: 'Test Server'},
    });

    const {getByText} = render(<DeleteServerPage />);

    expect(
      getByText('Are you sure you want to remove this server?'),
    ).toBeInTheDocument();
    expect(
      getByText(`\`Test Server' will be lost forever! (A long time!)`),
    ).toBeInTheDocument();
  });

  test('calls deleteUserServer and navigates back on delete button click', async () => {
    mockDeleteUserServer.mockResolvedValueOnce(null);
    mockUseLocation.mockReturnValue({
      state: {id: '123', listId: '456'},
    });

    const {getByText} = render(<DeleteServerPage />);

    fireEvent.click(getByText('Delete'));

    await waitFor(() => {
      expect(mockDeleteUserServer).toHaveBeenCalledWith('123', '456');
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test('navigates back on cancel button click', () => {
    mockUseLocation.mockReturnValue({
      state: {},
    });

    const {getByText} = render(<DeleteServerPage />);

    fireEvent.click(getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
