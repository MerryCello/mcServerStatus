/** @jest-environment jsdom */
import React from 'react';
import {fireEvent, render, waitFor, within} from '@testing-library/react';
import {useWindowDimensions} from '../../src/hooks/useWindowDimensions';
import {
  getUserServers,
  getUserSharedListsIds,
  hasReachedSharedListLimit,
  moveUserServer,
} from '../../src/firebase/controlers';
import LandingPage from '../../src/pages/LandingPage';

jest.mock('../../src/hooks/useWindowDimensions');
jest.mock('../../src/firebase/controlers', () => ({
  __esModule: true,
  createSharedList: jest.fn(),
  getUserServers: jest.fn(),
  getUserSharedListsIds: jest.fn(),
  hasReachedSharedListLimit: jest.fn(),
  moveUserServer: jest.fn(() => ({catch: jest.fn()})),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('use-long-press', () => ({
  useLongPress: () => () => ({}),
}));

jest.mock('react-movable', () => ({
  List: ({values, renderList, renderItem}) =>
    renderList({
      children: values.map((value, index) =>
        renderItem({value, index, props: {}}),
      ),
      props: {},
    }),
}));

jest.mock('../../src/components/ServerCard', () => {
  const React = require('react');
  const ServerCard = React.forwardRef(
    (
      {
        showUpArrow,
        showDownArrow,
        onUpClick,
        onDownClick,
        onFocus,
        onBlur,
        tabIndex,
        index,
      },
      ref,
    ) => (
      <div
        ref={ref}
        data-testid='server-card'
        tabIndex={tabIndex}
        onFocus={() => onFocus?.(index)}
        onBlur={(event) => onBlur?.(event)}
        onKeyDown={(event) => {
          if (event.shiftKey && event.key === 'ArrowUp') {
            onUpClick?.(index);
          }
          if (event.shiftKey && event.key === 'ArrowDown') {
            onDownClick?.(index);
          }
        }}>
        {showUpArrow && (
          <button data-testid='up-button' onClick={() => onUpClick?.(index)}>
            Up
          </button>
        )}
        {showDownArrow && (
          <button
            data-testid='down-button'
            onClick={() => onDownClick?.(index)}>
            Down
          </button>
        )}
      </div>
    ),
  );
  return {__esModule: true, ServerCard};
});

jest.mock('../../src/components/Button', () => {
  const React = require('react');
  const Button = React.forwardRef(
    ({children, onClick, disabled, tabIndex}, ref) => (
      <button
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        tabIndex={tabIndex}>
        {children}
      </button>
    ),
  );
  return {__esModule: true, Button};
});

jest.mock('../../src/components/Loading', () => {
  const React = require('react');
  const Loading = () => <div data-testid='loading' />;
  return {__esModule: true, Loading};
});

jest.mock('superagent', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => ({
      then: () => ({catch: () => {}}),
      catch: () => {},
    })),
  },
}));

const mockServer = (id: string) => ({
  id,
  name: `Server ${id}`,
  address: `server-${id}.example.com`,
});

const setupLandingPage = async (width: number = 1000) => {
  const mockNavigate = jest.fn();
  const mockParams = {sharedListId: undefined};
  const mockSetters = Array.from({length: 6}, () => jest.fn());
  const useStateSpy = jest.spyOn(React, 'useState') as jest.Mock;
  useStateSpy
    .mockReturnValueOnce([[mockServer('1'), mockServer('2')], mockSetters[0]])
    .mockReturnValueOnce([null, mockSetters[1]])
    .mockReturnValueOnce([true, mockSetters[2]])
    .mockReturnValueOnce([true, mockSetters[3]])
    .mockReturnValueOnce([false, mockSetters[4]])
    .mockReturnValueOnce([null, mockSetters[5]]);
  (useWindowDimensions as jest.Mock).mockReturnValue({
    width,
    height: 800,
  });
  const servers = [mockServer('1'), mockServer('2')];
  (getUserServers as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve(servers),
  );
  (getUserSharedListsIds as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve([]),
  );
  (hasReachedSharedListLimit as jest.Mock).mockReturnValue(false);
  const reactRouterDom = require('react-router-dom');
  reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
  reactRouterDom.useParams.mockReturnValue(mockParams);

  const renderResult = render(<LandingPage />);
  await waitFor(() => {
    expect(getUserServers).toHaveBeenCalled();
  });
  await waitFor(() => {
    expect(renderResult.getAllByTestId('server-card').length).toBe(2);
  });
  return {renderResult, mockNavigate};
};

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call moveUserServer when the UP button is clicked on desktop', async () => {
    const {renderResult} = await setupLandingPage(1000);

    const cards = renderResult.getAllByTestId('server-card');
    const secondCard = cards[1];
    fireEvent.mouseEnter(secondCard);

    const upButton = within(secondCard).getByTestId('up-button');
    fireEvent.click(upButton);

    expect(moveUserServer).toHaveBeenCalledWith(1, 0, undefined);
  });

  it('should call moveUserServer when the DOWN button is clicked on desktop', async () => {
    const {renderResult} = await setupLandingPage(1000);

    const cards = renderResult.getAllByTestId('server-card');
    const firstCard = cards[0];
    fireEvent.mouseEnter(firstCard);

    const downButton = within(firstCard).getByTestId('down-button');
    fireEvent.click(downButton);

    expect(moveUserServer).toHaveBeenCalledWith(0, 1, undefined);
  });

  it('should call moveUserServer when the SHIFT+UP button is pressed on desktop', async () => {
    const {renderResult} = await setupLandingPage(1000);

    const cards = renderResult.getAllByTestId('server-card');
    const secondCard = cards[1];
    secondCard.focus();
    fireEvent.keyDown(secondCard, {key: 'ArrowUp', shiftKey: true});

    expect(moveUserServer).toHaveBeenCalledWith(1, 0, undefined);
  });

  it('should call moveUserServer when the SHIFT+DOWN button is pressed on desktop', async () => {
    const {renderResult} = await setupLandingPage(1000);

    const cards = renderResult.getAllByTestId('server-card');
    const firstCard = cards[0];
    firstCard.focus();
    fireEvent.keyDown(firstCard, {key: 'ArrowDown', shiftKey: true});

    expect(moveUserServer).toHaveBeenCalledWith(0, 1, undefined);
  });

  it('should call moveUserServer when the SHIFT+UP button is pressed on mobile', async () => {
    const {renderResult} = await setupLandingPage(450);

    const cards = renderResult.getAllByTestId('server-card');
    const secondCard = cards[1];
    secondCard.focus();
    fireEvent.keyDown(secondCard, {key: 'ArrowUp', shiftKey: true});

    expect(moveUserServer).toHaveBeenCalledWith(1, 0, undefined);
  });

  it('should call moveUserServer when the SHIFT+DOWN button is pressed on mobile', async () => {
    const {renderResult} = await setupLandingPage(450);

    const cards = renderResult.getAllByTestId('server-card');
    const firstCard = cards[0];
    firstCard.focus();
    fireEvent.keyDown(firstCard, {key: 'ArrowDown', shiftKey: true});

    expect(moveUserServer).toHaveBeenCalledWith(0, 1, undefined);
  });
});
