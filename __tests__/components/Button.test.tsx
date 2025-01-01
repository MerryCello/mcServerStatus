import React from 'react';
import {render} from '@testing-library/react';
import Button from '../../src/components/Button';

// jest.mock('../../src/images/Button_Plate.mp3', () => 'Button_Plate.mp3');

xdescribe('Button', () => {
  it('should render a button', () => {
    const {container} = render(<Button>{'test'}</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});
