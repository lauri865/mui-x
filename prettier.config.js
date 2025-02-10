const defaultConfig = require('@mui/monorepo/prettier.config');

module.exports = {
  ...defaultConfig,
  plugins: ['prettier-plugin-organize-imports'],
};
