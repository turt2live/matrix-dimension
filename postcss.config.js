module.exports = {
    parser: 'postcss-scss',
    plugins: {
        'postcss-import': {},
        'postcss-cssnext': {browsers: ['last 2 version'], warnForDuplicates: false},
        'cssnano': {zindex: false}
    }
};