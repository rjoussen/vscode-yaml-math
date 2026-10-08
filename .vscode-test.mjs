import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/integration/**/*.test.js',
  workspaceFolder: './test/fixtures',
  // The YAML extension must provide `registerHoverTransformer`; point this at a checkout that does.
  extensionDevelopmentPath: ['.', process.env.VSCODE_YAML_PATH ?? '../vscode-yaml'],
  mocha: {
    ui: 'bdd',
    timeout: 20_000,
  },
});
