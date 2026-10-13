import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  {
    ignores: [
      '.agents/**',
      '.claude/**',
      '.codex/**',
      '.cursor/**',
      '.hallmark/**',
      '.impeccable/**',
      '.next/**',
      '.open-next/**',
      '.source/**',
      '.wrangler/**',
      'designs/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
      'scripts/generate-cinematic-loop.m',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'warn',
    },
  },
];
