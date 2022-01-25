/**
 * Internal dependencies
 */
const { getArg, getArgs, getFileArgs, hasArg, hasFileArg } = require('./cli');
const {
	getScriptsConfig,
	getWebpackArgs,
	hasBabelConfig,
	hasPostCSSConfig,
} = require('./config');
const { getPackagePath, hasPackageProp, hasProjectFile } = require('./file');

module.exports = {
	getArg,
	getArgs,
	getFileArgs,
	getPackagePath,
	getScriptsConfig,
	getWebpackArgs,
	hasArg,
	hasBabelConfig,
	hasFileArg,
	hasPackageProp,
	hasPostCSSConfig,
	hasProjectFile,
};
