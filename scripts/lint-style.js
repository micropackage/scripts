/**
 * External dependencies
 */
const { sync: spawn } = require( 'cross-spawn' );
const { sync: resolveBin } = require( 'resolve-bin' );

/**
 * Internal dependencies
 */
const {
	getArgs,
	hasArg,
	hasFileArg,
	hasPackageProp,
	hasProjectFile,
} = require( '../utils' );

const args = getArgs();

const defaultFilesArgs = hasFileArg() ? [] : [ '**/*.{css,scss}' ];

const hasLintConfig =
	hasArg( '--config' ) ||
	hasProjectFile( '.stylelintrc.js' ) ||
	hasProjectFile( '.stylelintrc.json' ) ||
	hasProjectFile( '.stylelintrc.yaml' ) ||
	hasProjectFile( '.stylelintrc.yml' ) ||
	hasProjectFile( 'stylelint.config.js' ) ||
	hasProjectFile( '.stylelintrc' ) ||
	hasPackageProp( 'stylelint' );

const defaultConfigArgs = ! hasLintConfig
	? [ '--config', require.resolve( '../config/.stylelintrc.json' ) ]
	: [];

const hasIgnoredFiles = hasArg( '--ignore-path' ) || hasProjectFile( '.stylelintignore' );

const defaultIgnoreArgs = ! hasIgnoredFiles
	? [ '--ignore-path', require.resolve( '../config/.stylelintignore' ) ]
	: [];

const result = spawn(
	resolveBin( 'stylelint' ),
	[
		...defaultConfigArgs,
		...defaultIgnoreArgs,
		...args,
		...defaultFilesArgs,
	],
	{ stdio: 'inherit' }
);

process.exit( result.status );
