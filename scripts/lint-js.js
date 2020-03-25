/**
 * External dependencies
 */
const { sync: spawn } = require("cross-spawn");
const { sync: resolveBin } = require("resolve-bin");

/**
 * Internal dependencies
 */
const {
	getArgs,
	hasArg,
	hasPackageProp,
	hasProjectFile,
	hasFileArg
} = require("../utils");

const args = getArgs();

const defaultFilesArgs = hasFileArg() ? [] : ["."];

const hasLintConfig =
	hasArg("-c") ||
	hasArg("--config") ||
	hasProjectFile(".eslintrc.js") ||
	hasProjectFile(".eslintrc.json") ||
	hasProjectFile(".eslintrc.yaml") ||
	hasProjectFile(".eslintrc.yml") ||
	hasProjectFile("eslintrc.config.js") ||
	hasProjectFile(".eslintrc") ||
	hasPackageProp("eslintConfig");

const defaultConfigArgs = !hasLintConfig
	? ["--no-eslintrc", "--config", require.resolve("../config/.eslintrc.json")]
	: [];

const hasIgnoredFiles =
	hasArg("--ignore-path") || hasProjectFile(".eslintignore");

const defaultIgnoreArgs = !hasIgnoredFiles
	? ["--ignore-path", require.resolve("../config/.eslintignore")]
	: [];

const result = spawn(
	resolveBin("eslint"),
	[...defaultConfigArgs, ...defaultIgnoreArgs, ...args, ...defaultFilesArgs],
	{ stdio: "inherit" }
);

process.exit(result.status);
