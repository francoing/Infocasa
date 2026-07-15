/**
 * Fitness function del frontend (con dientes).
 * Lee los límites de .ai/policies/architecture-policies.yaml (paridad con el backend:
 * "la herramienta lee el YAML"). Los dientes = reglas en `error` + boundary UI→api + gate
 * `npm run lint --max-warnings 0` en CI y pre-commit.
 *
 * Ajustar umbrales en el YAML, NO acá.
 *
 * RATCHET: `LEGACY` lista la deuda de reconciliación que ya existía al adoptar el linter.
 * Regla de oro: NO agregar entradas nuevas. Cada archivo se saca de la lista cuando se
 * refactoriza en su propia spec (ver PROJECT-MAP.md → "Deuda técnica / drift conocido").
 * El gate bloquea cualquier violación NUEVA fuera de esta lista.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const policies = yaml.load(
  fs.readFileSync(path.join(__dirname, '.ai/policies/architecture-policies.yaml'), 'utf8')
);
const S = policies.scopes;

/** Reglas de tamaño/complejidad para un scope del YAML. */
const sizeRules = (scope) => ({
  'max-lines': ['error', { max: scope.max_lines, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': [
    'error',
    { max: scope.max_lines_per_function, skipBlankLines: true, skipComments: true },
  ],
  complexity: ['error', scope.complexity],
  'max-depth': ['error', scope.max_depth],
});

// Boundary: la capa UI (features/, common/) NO puede importar el cliente HTTP (api/api.js).
// La capa de datos (hooks/) y el arranque de sesión (store/useAuthStore) sí pueden; los tests lo mockean.
const apiBoundary = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['**/api/api', '**/api/api.js'],
          message:
            'El cliente HTTP (api/api.js) solo puede importarse desde src/hooks/** — mové la llamada a un hook (ver .ai/context/architecture.md).',
        },
      ],
    },
  ],
};

// --- RATCHET: deuda de reconciliación existente al adoptar el linter (NO agregar). ---
// Cada entrada se elimina cuando el archivo se refactoriza en su spec. Ver PROJECT-MAP.md.
const LEGACY = {
  // Capa UI llamando al HTTP directo (boundary) + componentes/páginas gigantes:
  'src/common/components/PropertyCard.jsx': ['complexity', 'no-restricted-imports', 'react-hooks/rules-of-hooks'],
  'src/features/dashboard/pages/DashboardPage.jsx': ['complexity', 'max-lines', 'max-lines-per-function'],
  'src/features/explore/pages/ExplorePage.jsx': ['no-restricted-imports'],
  'src/features/home/components/ProvinceMap.jsx': ['react-hooks/rules-of-hooks'],
  'src/features/home/pages/HomePage.jsx': ['max-lines', 'max-lines-per-function'],
  'src/features/profile/pages/ProfilePage.jsx': ['complexity', 'max-lines', 'max-lines-per-function'],
  'src/features/property/components/PropertyForm.jsx': ['complexity', 'max-lines', 'max-lines-per-function'],
  'src/features/property/components/PropertyMap.jsx': ['react-hooks/rules-of-hooks'],
  'src/features/property/pages/CreatePropertyPage.jsx': ['no-restricted-imports'],
  'src/features/property/pages/PropertyDetailPage.jsx': ['complexity', 'max-lines', 'max-lines-per-function'],
  'src/features/search/pages/SearchPage.jsx': ['max-lines-per-function'],
  // Capa de datos (hooks) sobredimensionada / rules-of-hooks:
  'src/hooks/useDashboardData.js': ['complexity', 'max-lines', 'max-lines-per-function'],
  'src/hooks/useLeads.js': ['react-hooks/rules-of-hooks'],
  'src/hooks/usePlans.js': ['react-hooks/rules-of-hooks'],
  'src/hooks/useProperties.js': ['complexity', 'react-hooks/rules-of-hooks'],
  'src/hooks/usePropertyDetail.js': ['max-lines-per-function'],
};
const legacyOverrides = Object.entries(LEGACY).map(([file, rules]) => ({
  files: [file],
  rules: Object.fromEntries(rules.map((r) => [r, 'off'])),
}));

module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  plugins: ['react', 'react-refresh'],
  ignorePatterns: ['dist', 'node_modules', 'src/mock/**', '*.config.js', '.eslintrc.cjs'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    // Ruido de legado / no-arquitectónico: diferido (limpieza de estilo aparte, no es el gate).
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-useless-catch': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-refresh/only-export-components': 'off',
  },
  overrides: [
    // Boundary solo en la capa UI (donde importa que no se toque el HTTP directo).
    { files: ['src/features/**/*.{js,jsx}', 'src/common/**/*.{js,jsx}'], rules: apiBoundary },
    // Límites de tamaño/complejidad por scope.
    { files: ['src/hooks/**/*.js'], rules: sizeRules(S.hook) },
    { files: S.component.files, rules: sizeRules(S.component) },
    { files: S.page.files, rules: sizeRules(S.page) },
    // Tests: sin límite de tamaño.
    { files: ['src/test/**/*.{js,jsx}', '**/*.test.{js,jsx}'], rules: { 'max-lines-per-function': 'off', 'max-lines': 'off' } },
    // RATCHET (último = gana): apaga solo las reglas que la deuda existente ya violaba.
    ...legacyOverrides,
  ],
};
