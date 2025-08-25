module.exports = {
  env: {
    node: true,   // 👈 enables Node.js globals like require, module, exports
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {},
};
