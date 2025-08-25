import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,   // allow require, module, exports
        ...globals.es2021, // allow modern JS features
      },
    },
    rules: {
      "no-unused-vars": "warn"  // you can relax this
    },
  },
];
