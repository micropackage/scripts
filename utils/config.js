/**
 * External dependencies
 */
const { basename } = require('path');

/**
 * Internal dependencies
 */
const { hasPackageProp, getPackageProp, hasProjectFile } = require('./file');
const { getArgs, getFileArgs, hasArg, hasFileArg } = require('./cli');

const hasBabelConfig = () =>
	hasProjectFile('.babelrc.js') ||
	hasProjectFile('.babelrc.json') ||
	hasProjectFile('babel.config.js') ||
	hasProjectFile('babel.config.json') ||
	hasProjectFile('.babelrc') ||
	hasPackageProp('babel');

const hasPostCSSConfig = () => hasProjectFile('postcss.config.js');

const hasWebpackConfig = () =>
	hasArg('--config') ||
	hasProjectFile('webpack.config.js') ||
	hasProjectFile('webpack.config.babel.js');

const getWebpackArgs = (additionalArgs = []) => {
	let webpackArgs = getArgs();

	if (hasFileArg()) {
		webpackArgs = webpackArgs.map((arg) => {
			if (getFileArgs().includes(arg) && !arg.includes('=')) {
				const entry = basename(arg, '.js');

				if (!arg.startsWith('./')) {
					arg = './' + arg;
				}

				return [entry, arg].join('=');
			}

			return arg;
		});
	}

	if (!hasWebpackConfig()) {
		webpackArgs.push(
			'--config',
			require.resolve('../config/webpack.config.js')
		);
	}

	webpackArgs.push(...additionalArgs);

	return webpackArgs;
};

const getScriptsConfig = () => getPackageProp('mpScriptsConfig');

module.exports = {
	getScriptsConfig,
	getWebpackArgs,
	hasBabelConfig,
	hasPostCSSConfig,
};
