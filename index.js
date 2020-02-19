/**
 * Internal dependencies
 */
const RemoveSuprefluousAssetsPlugin = require( './plugins/remove-superfluous-assets' );
const webpackConfig = require( './config/webpack.config' );

module.exports = {
	RemoveSuprefluousAssetsPlugin,
	webpackConfig,
};
