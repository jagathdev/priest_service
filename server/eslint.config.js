import globals from "globals";

export default [
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-undef": "error",
            "no-console": "off",
        },
    },
];
