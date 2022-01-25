/**
 * External dependencies
 */
const minimist = require('minimist');

const getArgs = () => process.argv.slice(2);

const getArg = (key, defaultVal = undefined) => {
	for (const arg of getArgs()) {
		const [name, value] = arg.split('=');

		if (name === key) {
			return value || null;
		}
	}

	return defaultVal;
};

const hasArg = (arg) => getArg(arg) !== undefined;

const getFileArgs = () => minimist(getArgs())._;

const hasFileArg = () => getFileArgs().length > 0;

module.exports = {
	getArg,
	getArgs,
	getFileArgs,
	hasArg,
	hasFileArg,
};
