import nextVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextVitals,
  {
    rules: {
      "no-useless-escape": "off",
      "react/no-unescaped-entities": ["error", { forbid: ["<", ">", "{", "}"] }],
      "prefer-const": "error",
      "no-var": "error",
      "@next/next/no-img-element": "error",
    },
  },
];
