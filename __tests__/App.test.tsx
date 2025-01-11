/** @jest-environment jsdom */
import React from 'react';
import {render, screen} from '@testing-library/react';
import {test, expect} from '@jest/globals';
import '@testing-library/jest-dom';
import App from '../src/App';

jest.mock('../src/pages/LandingPage', () => 'landing-page');

describe('App', () => {
  test('renders LandingPage by default', () => {
    const app = render(<App />);
    const landingPage = screen.getByTestId('LandingPage');
    expect(landingPage).toBeDefined();
    expect(app.container).toMatchSnapshot();
  });
});
