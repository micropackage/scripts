/**
 * External dependencies
 */
const { sync: readPkgUp } = require("read-pkg-up");
const path = require("path");
const { realpathSync, existsSync } = require("fs");

const { packageJson: pkg, path: pkgPath } = readPkgUp({
	cwd: realpathSync(process.cwd())
});

const getPackagePath = () => pkgPath;

const hasPackageProp = prop => pkg && pkg.hasOwnProperty(prop);

const getPackageProp = prop => {
	if (hasPackageProp(prop)) {
		return pkg[prop];
	}

	return {};
};

const hasProjectFile = fileName =>
	existsSync(path.join(path.dirname(getPackagePath()), fileName));

module.exports = {
	getPackagePath,
	getPackageProp,
	hasPackageProp,
	hasProjectFile
};
