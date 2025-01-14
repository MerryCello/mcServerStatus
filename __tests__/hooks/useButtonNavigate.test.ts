/** @jest-environment jsdom */
import {renderHook} from '@testing-library/react';
import {useButtonNavigate} from '../../src/hooks';
import {useNavigate} from 'react-router-dom';

// @ts-ignore
jest.spyOn(global, 'setTimeout').mockImplementation((cb) => cb());

describe('useButtonNavigate', () => {
  it('navigates to linkTo with options after 100ms', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    const {
      result: {current: buttonNavigate},
    } = renderHook(useButtonNavigate);
    buttonNavigate('/new-page', {replace: true});
    expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
    expect(mockNavigate).toHaveBeenCalledWith('/new-page', {replace: true});
  });
});
