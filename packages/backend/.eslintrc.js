module.exports = {
    env: {
        "browser": true,
        "es6": true,
        "node": true,
    },
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "airbnb-typescript/base",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "project": "tsconfig.json",
        "sourceType": "module",
        tsconfigRootDir: __dirname,
    },
    plugins: [
        "eslint-plugin-jsdoc",
        "eslint-plugin-prefer-arrow",
        "eslint-plugin-import",
        "@typescript-eslint",
    ],
    rules: {
        "@typescript-eslint/no-throw-literal": "off",
        "@typescript-eslint/no-explicit-any": ["warn"],
        "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
        "@typescript-eslint/no-unsafe-assignment": ["warn"],
        "@typescript-eslint/no-unsafe-member-access": ["warn"],
        "eol-last": ["error", "always"],
        "quotes": ["error", "single", { "allowTemplateLiterals": true }],
        "semi": "error",
        "no-trailing-spaces": "error",
        "comma-dangle": ["error", "always-multiline"],
    },
};
