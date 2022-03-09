/**
 * External dependencies
 */
const { existsSync, lstatSync, readdirSync } = require('fs');
const globImporter = require('node-sass-glob-importer');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

/**
 * WordPress dependencies
 */
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

/**
 * Internal dependencies
 */
const RemoveSuprefluousAssetsPlugin = require('../plugins/remove-superfluous-assets');
const {
	getArg,
	getPackagePath,
	getScriptsConfig,
	hasArg,
	hasBabelConfig,
	hasFileArg,
	hasPostCSSConfig,
} = require('../utils');

const pkgPath = getPackagePath();

const config = getScriptsConfig();

const paths = Object.assign(
	{
		src: 'src/assets',
		output: 'dist',
		scripts: 'js',
		styles: 'scss',
		images: 'images',
		fonts: 'fonts',
	},
	config && config.paths ? config.paths : {}
);

for (const pathKey in paths) {
	let pathValue = getArg(`--${pathKey}-path`, paths[pathKey]);

	if (['src', 'output'].includes(pathKey) && '/' !== pathValue.charAt(0)) {
		pathValue = path.join(path.dirname(pkgPath), pathValue);
	}

	paths[pathKey] = pathValue;
}

let context;
const entry = {};

if (!hasFileArg()) {
	if (!existsSync(paths.src)) {
		/* eslint-disable-next-line no-console */
		console.log('Source directory does not exist.');
		process.exit(1);
	}

	context = paths.src;

	const addEntry = (file, srcPath, outputPath) => {
		const ext = path.extname(file);
		const name = path.basename(file, ext);

		if ('_' !== name.charAt(0)) {
			const filePath = path.join(srcPath, file);
			outputPath = outputPath.replace('scss', 'css');

			if (lstatSync(filePath).isFile()) {
				entry[`${outputPath}/${name}`] = filePath;
			}
		}
	};

	const directoryErrors = [];
	let hasDirectory = false;

	for (const assetType of ['scripts', 'styles']) {
		if (false === paths[assetType]) {
			continue;
		}

		const srcPath = path.join(paths.src, paths[assetType]);

		if (!existsSync(srcPath)) {
			const ucFirstAssetType =
				assetType.charAt(0).toUpperCase() + assetType.slice(1);

			directoryErrors.push(
				`${ucFirstAssetType} directory does not exist. Skipping...`
			);
			continue;
		}

		hasDirectory = true;

		readdirSync(srcPath).forEach((file) =>
			addEntry(file, srcPath, paths[assetType])
		);
	}

	if (!hasDirectory) {
		/* eslint-disable-next-line no-console */
		console.log(`Scripts and styles directories does not exist.`);
		process.exit(1);
	} else if (directoryErrors.length) {
		for (const error of directoryErrors) {
			/* eslint-disable-next-line no-console */
			console.log(error);
		}
	}

	if (!entry) {
		/* eslint-disable-next-line no-console */
		console.log('No entry files available.');
		process.exit(1);
	}
}

const alias = Object.fromEntries(
	Object.entries(paths)
		.filter(([key]) =>
			['scripts', 'styles', 'images', 'fonts'].includes(key)
		)
		.map(([, value]) => [value, `${paths.src}/${value}`])
);

const mode = getArg(
	'--mode',
	process.env.NODE_ENV === 'production' ? 'production' : 'development'
);
const isProduction = 'production' === mode;

const imageWebpackLoaderConfig = {
	loader: 'image-webpack-loader',
	options: {
		disable: false === config.imagemin,
		...('object' === typeof config.imagemin && config.imagemin),
	},
};

module.exports = {
	mode,
	context,
	entry,
	output: {
		path: paths.output,
		filename: '[name].js',
		publicPath: '../',
	},
	resolve: {
		alias,
		extensions: ['.ts', '.tsx', '...'],
		roots: [path.resolve(pkgPath)],
	},
	devtool: isProduction ? false : 'source-map',
	module: {
		rules: [
			{
				test: /\.(t|j)sx?$/,
				exclude: /node_modules/,
				use: [
					require.resolve('thread-loader'),
					{
						loader: require.resolve('babel-loader'),
						options: {
							// Babel uses a directory within local node_modules
							// by default. Use the environment variable option
							// to enable more persistent caching.
							cacheDirectory:
								process.env.BABEL_CACHE_DIRECTORY || true,
							...(!hasBabelConfig() && {
								babelrc: false,
								configFile: false,
								presets: [
									require.resolve(
										'@wordpress/babel-preset-default'
									),
								],
							}),
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
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							...(!hasPostCSSConfig() && {
								postcssOptions: {
									plugins: () => [require('autoprefixer')],
								},
							}),
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								importer: [globImporter()],
							},
							sourceMap: true,
						},
					},
				],
			},
			{
				test: /\.(png|svg|jpe?g|gif)$/,
				oneOf: [
					{
						issuer: /\.(ts|tsx|js|jsx)$/,
						resourceQuery: { not: /inline/ },
						test: /\.svg$/,
						type: 'javascript/auto',
						use: [
							'@svgr/webpack',
							{
								loader: 'url-loader',
								options: {
									limit: config.inlineAssets
										? config.inlineAssets
										: false,
									name: '[hash].[ext]',
									outputPath: paths.images,
								},
							},
							imageWebpackLoaderConfig,
						],
					},
					{
						resourceQuery: { not: /inline/ },
						generator: {
							filename: `${paths.images}/[hash][ext][query]`,
						},
						type:
							config.inlineAssets === false
								? 'asset'
								: 'asset/resource',
						use: [imageWebpackLoaderConfig],
						...(Number.isInteger(config.inlineAssets) && {
							parser: {
								dataUrlCondition: {
									maxSize: config.inlineAssets,
								},
							},
						}),
					},
					{
						resourceQuery: /inline/,
						type: 'asset/inline',
						use: [imageWebpackLoaderConfig],
					},
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
				generator: {
					filename: `${paths.fonts}/[hash][ext][query]`,
				},
			},
		],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true,
				},
			}),
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
		!hasArg('--no-deps') &&
			new DependencyExtractionWebpackPlugin({
				injectPolyfill: true,
			}),
		new RemoveSuprefluousAssetsPlugin(),
		!isProduction && new LiveReloadPlugin(),
	].filter(Boolean),
};
