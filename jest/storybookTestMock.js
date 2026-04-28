// Mock for storybook/test — used in spec files for interaction testing
const userEvent = {
  click: () => Promise.resolve(),
  type: () => Promise.resolve(),
  clear: () => Promise.resolve(),
  tab: () => Promise.resolve(),
  keyboard: () => Promise.resolve(),
  setup: () => userEvent,
};

const within = (element) => ({
  queryByText: (text) => element ? element.querySelector(`*`) : null,
  getByText: (text) => element ? element.querySelector(`*`) : null,
  getByRole: (role) => element ? element.querySelector(`[role="${role}"]`) : null,
});

const expect = global.expect;

module.exports = { userEvent, within, expect };
