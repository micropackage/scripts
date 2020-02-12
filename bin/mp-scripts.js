#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * External dependencies
 */
const spawn = require( 'cross-spawn' );

/**
 * Internal dependencies
 */
const {
	getArgs,
} = require( '../utils' );

const [ script, ...args ] = getArgs();

if ( ! [
	'build',
	'lint-js',
	'lint-style',
	'start',
].includes( script ) ) {
	if ( undefined === script ) {
		console.log('No script specified.');
	} else {
		console.log('Unknown script "' + script + '".');
	}
	process.exit( 1 );
}

const { signal, status } = spawn.sync(
	'node',
	[
		require.resolve( '../scripts/' + script ),
		...args,
	],
	{ stdio: 'inherit' }
);

if ( signal ) {
	if ( signal === 'SIGKILL' ) {
		console.log(
			'The script failed because the process exited too early. ' +
				'This probably means the system ran out of memory or someone called ' +
				'`kill -9` on the process.'
		);
	} else if ( signal === 'SIGTERM' ) {
		console.log(
			'The script failed because the process exited too early. ' +
				'Someone might have called `kill` or `killall`, or the system could ' +
				'be shutting down.'
		);
	}
	process.exit( 1 );
}

process.exit( status );
