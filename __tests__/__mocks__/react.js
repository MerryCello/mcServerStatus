module.exports = {
  ...jest.requireActual('react'),
  useState: jest.fn((initState) => [initState, jest.fn()]),
}