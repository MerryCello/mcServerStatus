/** @jest-environment jsdom */
import React, { useState } from 'react';
import { render } from '@testing-library/react';
import Signal from '../../src/components/Signal';

const mockSetSigImg = jest.fn();

describe('Signal', () => {
  const defaultProps = {
    server: {
      hostname: 'localhost',
      online: true,
      loading: false,
      pingAvgMs: 0,
    },
    size: 2,
    style: {},
  };

  afterEach(() => {
    mockSetSigImg.mockClear();
  });

  beforeEach(() => {
    (useState as jest.Mock).mockReturnValueOnce(['searchingSignal', mockSetSigImg]);
  })

  it('should render searching signal when loading', () => {
    const { container } = render(<Signal {...defaultProps} server={{ ...defaultProps.server, loading: true }} />);
    expect(mockSetSigImg).toHaveBeenCalledWith('searchingSignal');
    expect(container).toMatchSnapshot();
  });

  it('should render no signal when server is offline', () => {
    const { container } = render(<Signal {...defaultProps} server={{ ...defaultProps.server, online: false }} />);
    expect(mockSetSigImg).toHaveBeenCalledWith('noSignal');
    expect(container).toMatchSnapshot();
  });

  it('should render full signal when ping is excellent', () => {
    const { container } = render(<Signal {...defaultProps} server={{ ...defaultProps.server, pingAvgMs: 1000 }} />);
    expect(mockSetSigImg).toHaveBeenCalledWith('fullSignal');
    expect(container).toMatchSnapshot();
  });

  it('should render bar4 signal when ping is very good', () => {
    const { container } = render(<Signal {...defaultProps} server={{ ...defaultProps.server, pingAvgMs: 1800 }} />);
    expect(mockSetSigImg).toHaveBeenCalledWith('bar4');
    expect(container).toMatchSnapshot();
  });

  it('should render bar3 signal when ping is good', () => {
    const { container } = render(<Signal {...defaultProps} server={{ ...defaultProps.server, pingAvgMs: 3000 }} />);
    expect(mockSetSigImg).toHaveBeenCalledWith('bar3');
    expect(container).toMatchSnapshot();
  });

  it('should render bar2 signal when ping is poor', () => {
    const { container } = render(<Signal {...defaultProps} server={{ ...defaultProps.server, pingAvgMs: 5000 }} />);
    expect(mockSetSigImg).toHaveBeenCalledWith('bar2');
    expect(container).toMatchSnapshot();
  });

  it('should render bar1 signal when ping is very poor', () => {
    const { container } = render(<Signal {...defaultProps} server={{ ...defaultProps.server, pingAvgMs: 9000 }} />);
    expect(mockSetSigImg).toHaveBeenCalledWith('bar1');
    expect(container).toMatchSnapshot();
  });
});