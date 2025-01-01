/**
 * @jest-environment jsdom
 */

import React from 'react';
import {render, screen} from '@testing-library/react';
import {test, expect} from '@jest/globals';
import '@testing-library/jest-dom';
import App from '../src/App';
import {BrowserRouter} from 'react-router-dom';

test('renders learn react link', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
  const linkElement = screen.getByText(/Server Status/i);
  // @ts-ignore
  expect(linkElement).toBeInTheDocument();
});
