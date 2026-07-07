import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: ["dist", "public/push-handler.js"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        Blob: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        document: "readonly",
        EventSource: "readonly",
        fetch: "readonly",
        File: "readonly",
        FormData: "readonly",
        import: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        window: "readonly",
        WebSocket: "readonly",
        process: "readonly",
        HTMLElement: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-static-element-interactions": "error",
    },
  },
  {
    files: [
      "src/components/dashboard/**/*.{js,jsx}",
      "src/components/chat/**/*.{js,jsx}",
      "src/components/reviews/**/*.{js,jsx}",
      "src/components/catalog/**/*.{js,jsx}",
      "src/components/ui/**/*.{js,jsx}",
      "src/components/skeletons/**/*.{js,jsx}",
      "src/components/pwa/**/*.{js,jsx}",
      "src/components/seo/**/*.{js,jsx}",
      "src/components/analytics/**/*.{js,jsx}",
      "src/components/a11y/**/*.{js,jsx}",
      "src/components/**/compare/**/*.{js,jsx}",
      "src/components/**/popular/**/*.{js,jsx}",
      "src/pages/**/*.{js,jsx}",
      "src/pages/dashboard/**/*.{js,jsx}",
      "src/hooks/dashboard/**/*.{js,jsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*", "../../../*", "../../../../*"],
              message:
                "Chuqur papkalarda `@/` aliasidan foydalaning (masalan: `import { x } from \"@/utils/foo.js\"`).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/pages/**/*.{js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Sahifalarda `@/` aliasidan foydalaning (masalan: `import { x } from \"@/hooks/useAuth.js\"`).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        fetch: "readonly",
        process: "readonly",
        setTimeout: "readonly",
      },
    },
  },
];
