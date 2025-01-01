/** @jest-environment jsdom */

import React from 'react';
import { render } from '@testing-library/react';
import Button from '../../src/components/Button';
import { useButtonNavigate } from '../../src/hooks';

jest.mock('../../src/hooks/useButtonNavigate');

describe('Button', () => {
  it('should render a button', () => {
    const { container, getByText } = render(<Button>{'test'}</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
    expect(getByText('test')).toBeDefined();
    expect(container).toMatchSnapshot();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button onClick={onClick}>{'test'}</Button>);
    getByText('test').click();
    expect(onClick).toHaveBeenCalled();
  });

  it('should play button plate audio when clicked', () => {
    const { getByText } = render(<Button>{'test'}</Button>);
    const audio = new global.Audio();
    getByText('test').click();
    expect(audio.play).toHaveBeenCalled();
  });

  it('should call navigate when linkTo is provided', () => {
    const mockNavigate = jest.fn();
    (useButtonNavigate as jest.Mock).mockReturnValue(mockNavigate);
    const { getByText } = render(<Button linkTo={'/test'}>{'test'}</Button>);
    getByText('test').click();
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should call navigate with linkTo and state when provided', () => {
    const mockNavigate = jest.fn();
    (useButtonNavigate as jest.Mock).mockReturnValue(mockNavigate);
    const { getByText } = render(
      <Button linkTo={'/test'} state={{ test: 'test' }}>{'text'}</Button>,
    );
    getByText('text').click();
    expect(mockNavigate).toHaveBeenCalledWith('/test', { state: { test: 'test' } });
  });
});
