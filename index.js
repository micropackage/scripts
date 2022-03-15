/**
 * Internal dependencies
 */
const eslintConfig = require('./eslint-config');
const RemoveSuprefluousAssetsPlugin = require('./plugins/remove-superfluous-assets');
const webpackConfig = require('./config/webpack.config');

module.exports = {
	eslintConfig,
	RemoveSuprefluousAssetsPlugin,
	webpackConfig,
};
