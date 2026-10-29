/* Entorno de pruebas: Jasmine (framework) + Karma (ejecutor en Chrome).
   webpack + Babel compilan el JSX; babel-plugin-istanbul instrumenta
   el código de src/ (sin las pruebas) para medir la cobertura. */

const path = require('path');

process.env.CHROME_BIN = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'webpack'],
        files: ['src/tests/index.js'],
        preprocessors: { 'src/tests/index.js': ['webpack', 'sourcemap'] },

        webpack: {
            mode: 'development',
            devtool: 'inline-source-map',
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        resolve: { fullySpecified: false },
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
                                plugins: [['istanbul', { exclude: ['src/tests/**'] }]]
                            }
                        }
                    }
                ]
            },
            resolve: { extensions: ['.js', '.jsx'] }
        },

        reporters: ['spec', 'coverage'],
        coverageReporter: {
            dir: path.join(__dirname, 'coverage'),
            reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcov' }]
        },

        browsers: ['ChromeHeadlessSinSandbox'],
        customLaunchers: {
            ChromeHeadlessSinSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox'] }
        },

        singleRun: true,
        restartOnFileChange: false
    });
};
