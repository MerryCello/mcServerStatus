const React = require('react');

module.exports = {
  ...jest.requireActual('react-router-dom'),
  To: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({ state: {} })),
  BrowserRouter: ({ children }) => React.createElement('BrowserRouter', { children }, children),
}