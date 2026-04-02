/** @jest-environment jsdom */
import React from 'react';
import {render} from '@testing-library/react';
import Signal, {getSignalImage} from '../../src/components/Signal';

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

  it('should render searching signal when loading', () => {
    expect(getSignalImage({...defaultProps.server, loading: true})).toBe(
      'searchingSignal',
    );

    const {container} = render(
      <Signal
        {...defaultProps}
        server={{...defaultProps.server, loading: true}}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render no signal when server is offline', () => {
    expect(getSignalImage({...defaultProps.server, online: false})).toBe(
      'noSignal',
    );

    const {container} = render(
      <Signal
        {...defaultProps}
        server={{...defaultProps.server, online: false}}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render full signal when ping is excellent', () => {
    expect(getSignalImage({...defaultProps.server, pingAvgMs: 1000})).toBe(
      'fullSignal',
    );

    const {container} = render(
      <Signal
        {...defaultProps}
        server={{...defaultProps.server, pingAvgMs: 1000}}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render bar4 signal when ping is very good', () => {
    expect(getSignalImage({...defaultProps.server, pingAvgMs: 1800})).toBe(
      'bar4',
    );

    const {container} = render(
      <Signal
        {...defaultProps}
        server={{...defaultProps.server, pingAvgMs: 1800}}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render bar3 signal when ping is good', () => {
    expect(getSignalImage({...defaultProps.server, pingAvgMs: 3000})).toBe(
      'bar3',
    );

    const {container} = render(
      <Signal
        {...defaultProps}
        server={{...defaultProps.server, pingAvgMs: 3000}}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render bar2 signal when ping is poor', () => {
    expect(getSignalImage({...defaultProps.server, pingAvgMs: 5000})).toBe(
      'bar2',
    );

    const {container} = render(
      <Signal
        {...defaultProps}
        server={{...defaultProps.server, pingAvgMs: 5000}}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render bar1 signal when ping is very poor', () => {
    expect(getSignalImage({...defaultProps.server, pingAvgMs: 9000})).toBe(
      'bar1',
    );

    const {container} = render(
      <Signal
        {...defaultProps}
        server={{...defaultProps.server, pingAvgMs: 9000}}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
