/**
 * External dependencies
 */
const { sync: readPkgUp } = require( 'read-pkg-up' );
const LiveReloadPlugin = require( 'webpack-livereload-plugin' );
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require( 'path' );
const {
	readdirSync,
	realpathSync,
	existsSync,
	lstatSync,
} = require( 'fs' );

/**
 * WordPress dependencies
 */
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

/**
 * Internal dependencies
 */
const RemoveSuprefluousAssetsPlugin = require( '../plugins/remove-superfluous-assets' );
const {
	hasBabelConfig,
	hasPostCSSConfig,
	getArg,
} = require( '../utils' );

const { path: pkgPath } = readPkgUp( {
	cwd: realpathSync( process.cwd() ),
} );

const entryDir = getArg( '--entry-dir', 'src/assets' );
const outputDir = getArg( '--output-dir', 'dist' );

const jsDir = getArg( '--js-dir', 'js' );
const styleDir = getArg( '--style-dir', 'scss' );

if ( ! existsSync( entryDir ) ) {
	/* eslint-disable-next-line no-console */
	console.log( 'Entry directory does not exist.' );
	process.exit( 1 );
}

const jsEntry = path.join( path.dirname( pkgPath ), entryDir, jsDir );
const styleEntry = path.join( path.dirname( pkgPath ), entryDir, styleDir );
const outputStyleDir = 'scss' === styleDir ? 'css' : styleDir;

const entry = {};

const addEntry = ( file, dir, ext = '.js' ) => {
	const name = path.basename( file, ext );

	if ( '_' !== name.charAt( 0 ) ) {
		const filePath = path.join( dir, file );
		const subdir = '.scss' === ext ? outputStyleDir : jsDir;

		if ( lstatSync( filePath ).isFile() ) {
			entry[ `${ subdir }/${ name }` ] = filePath;
		}
	}
}

if ( existsSync( jsEntry ) ) {
	readdirSync( jsEntry ).forEach( ( file ) => addEntry( file, jsEntry ) );
}

if ( existsSync( styleEntry ) ) {
	readdirSync( styleEntry ).forEach( ( file ) => addEntry( file, styleEntry, '.scss' ) );
}

if ( ! entry ) {
	/* eslint-disable-next-line no-console */
	console.log( 'No entry files available.' );
	process.exit( 1 );
}

const isProduction = process.env.NODE_ENV === 'production';
const mode = isProduction ? 'production' : 'development';

module.exports = {
	mode,
	context: path.join( path.dirname( pkgPath ), entryDir ),
	entry,
	output: {
		path: path.join( path.dirname( pkgPath ), outputDir ),
		filename: '[name].js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					require.resolve( 'thread-loader' ),
					{
						loader: require.resolve( 'babel-loader' ),
						options: {
							// Babel uses a directory within local node_modules
							// by default. Use the environment variable option
							// to enable more persistent caching.
							cacheDirectory:
								process.env.BABEL_CACHE_DIRECTORY || true,
							...( ! hasBabelConfig() && {
								babelrc: false,
								configFile: false,
								presets: [
									require.resolve(
										'@wordpress/babel-preset-default'
									),
								],
							} ),
						},
					},
				],
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							importLoaders: 2,
							sourceMap: true
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							...( ! hasPostCSSConfig() && {
								plugins: () => [
									require( 'autoprefixer' )
								],
							} ),
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					}
				],
			},
			{
				test: /\.svg$/,
				use: [ '@svgr/webpack' ],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin( {
			filename: '[name].css',
		} ),
		new DependencyExtractionWebpackPlugin( { injectPolyfill: true } ),
		new RemoveSuprefluousAssetsPlugin(),
		! isProduction && new LiveReloadPlugin(),
	].filter( Boolean ),
};
