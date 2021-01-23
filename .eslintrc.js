module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    settings: { 'import/resolver': { node: { extensions: ['.ts'] } } },
    extends: [
        '@tophat/eslint-config/base',
        '@tophat/eslint-config/jest',
        '@tophat/eslint-config/web',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended']
}
