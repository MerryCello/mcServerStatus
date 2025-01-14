/** @jest-environment jsdom */
import {useWindowDimensions} from '../../src/hooks';
import {renderHook} from '@testing-library/react';

describe('useWindowDimensions', () => {
  it('returns the window dimensions', () => {
    const {result} = renderHook(useWindowDimensions);
    expect(result.current).toEqual({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });

  it('updates the window dimensions on resize', () => {
    const {result, rerender} = renderHook(useWindowDimensions);
    const newDimensions = {width: 100, height: 100};
    window.innerWidth = newDimensions.width;
    window.innerHeight = newDimensions.height;
    window.dispatchEvent(new Event('resize'));
    rerender();
    expect(result.current).toEqual(newDimensions);
  });
});
