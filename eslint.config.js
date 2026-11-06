import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      // Local agent worktrees (full repo copies), never part of this project.
      ".claude/",
      "public/",
      "tmp/",
      "coverage/",
      "e2e/",
      // Legacy React 0.14 code, deleted at the end of Phase 3.
      "frontend/",
      "app/assets/",
      "app/views/",
      "bin/",
      "config/",
      "db/",
      "docs/",
      "lib/",
      "test/",
      "vendor/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },
  {
    files: ["*.config.{js,ts}"],
    languageOptions: { globals: { ...globals.node } },
    ...tseslint.configs.disableTypeChecked,
  },
);
