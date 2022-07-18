module.exports = {
  root: true,
  extends: ['@sourcerer/eslint'],
  rules: {
    'no-empty': ['error'],
    'no-console': ['warn'],
    'no-unused-vars': ['off'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-explicit-any': ['error']
  }
}
