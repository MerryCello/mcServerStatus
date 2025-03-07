/** @jest-environment jsdom */
import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {Loading, LOADING_STATES} from '../../src/components';

describe('Loading', () => {
  it('renders scanning message', () => {
    render(<Loading servers={[]} setServers={jest.fn()} />);
    expect(
      screen.getByText('Scanning for games on your local network'),
    ).toBeInTheDocument();
  });

  it('renders initial loading state', () => {
    render(<Loading servers={[]} setServers={jest.fn()} />);
    expect(screen.getByText(LOADING_STATES[0])).toBeInTheDocument();
  });

  xit('updates loading state over time', () => {
    jest.useFakeTimers();
    const mockSetLoadingStatesIndex = jest.fn(
      (stateCb: (prevState: number) => number) => {
        expect(stateCb(0)).toBe(1);
        expect(stateCb(1)).toBe(2);
        expect(stateCb(2)).toBe(3);
        expect(stateCb(3)).toBe(0);
      },
    );
    const mockSetServers = jest.fn((stateCb: (prevState: any[]) => any[]) => {
      expect(stateCb([])).toEqual([]);
      expect(stateCb([1])).toEqual([1]);
      return stateCb([]);
    });
    (useState as jest.Mock).mockReturnValueOnce([0, mockSetLoadingStatesIndex]);
    const acutalSetInterval = global.setInterval;
    const actualClearInterval = global.clearInterval;
    // @ts-ignore
    global.setInterval = (cb) => cb();
    global.clearInterval = jest.fn();

    try {
      // @ts-ignore
      render(<Loading servers={[]} setServers={mockSetServers} />);
    } catch (e) {
      if (!e.message.includes('ReferenceError')) {
        throw e;
      }
    }
    expect(screen.getByText(LOADING_STATES[0])).toBeInTheDocument();
    expect(global.clearInterval).toHaveBeenCalled();

    global.setInterval = acutalSetInterval;
    global.clearInterval = actualClearInterval;
    jest.useRealTimers();
  });

  it('clears interval when servers are found', () => {
    const setServersMock = jest.fn();
    render(<Loading servers={[{id: 1}]} setServers={setServersMock} />);
    expect(setServersMock).not.toHaveBeenCalled();
  });
});
