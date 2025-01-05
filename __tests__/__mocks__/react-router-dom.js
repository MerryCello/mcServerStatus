const React = require('react');

module.exports = {
  ...jest.requireActual('react-router-dom'),
  To: jest.fn(),
  BrowserRouter: ({ children }) => React.createElement('BrowserRouter', { children }, children),
}