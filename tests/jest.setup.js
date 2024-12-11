global.console = {
  ...global.console,
  info: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
