import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // React 19 / React Compiler rules are overly strict for common patterns
    // (subscribe-to-storage effects, ticking timers, Date.now in render).
    // Downgrade to warnings so CI still fails on real errors.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    files: ["src/components/show/**/*.tsx", "src/components/ui/**/*.tsx"],
    rules: {
      // Full-bleed slideshow rendering uses <img> deliberately for object-fit:contain.
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["src/app/app/displays/page.tsx"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
]);

export default eslintConfig;
