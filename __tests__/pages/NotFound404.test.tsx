/** @jest-environment jsdom */
import React from 'react';
import {render} from '@testing-library/react';
import NotFound404 from '../../src/pages/NotFound404';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteError: jest.fn(),
}));

describe('NotFound404', () => {
  test('renders 404 message', () => {
    const {container, getByText} = render(<NotFound404 />);
    expect(getByText('404: Not Found')).toBeInTheDocument();
    expect(
      getByText('The page you were looking for is in another realm'),
    ).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('renders decorative line', () => {
    const {getByText} = render(<NotFound404 />);
    expect(getByText('~~~~~~~~~~~~~~~~~~~')).toBeInTheDocument();
  });
});
