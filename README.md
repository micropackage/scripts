# Scripts

[![BracketSpace Micropackage](https://img.shields.io/badge/BracketSpace-Micropackage-brightgreen)](https://bracketspace.com)
[![npm](https://img.shields.io/npm/v/@micropackage/scripts)](https://www.npmjs.com/package/@micropackage/scripts)
[![License](https://img.shields.io/npm/l/@micropackage/scripts)](https://www.npmjs.com/package/@micropackage/scripts)

<p align="center">
    <img src="https://bracketspace.com/extras/micropackage/micropackage-small.png" alt="Micropackage logo"/>
</p>

## 🧬 About Scripts

This is a collection of scripts useful for (not only) WordPress development. Inspired by [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts), this package contianis essential tools with default configuration.

## 💾 Installation

You only need to install one module:
``` bash
npm install @micropackage/scripts --save-dev
```
or
``` bash
yarn add -D @micropackage/scripts
```

## 🕹 Usage

This package exposes a binary called `mp-scripts` which can be called directly with `npx` or `yarn`.
``` bash
npx mp-scripts build
yarn mp-scripts build
```
However it is intended to use this module in the `scripts` section in the `package.json` file of our project.

``` json
{
	"scripts": {
		"build": "mp-scripts build",
		"lint:js": "mp-scripts lint-js",
		"lint:style": "mp-scripts lint-style",
		"start": "mp-scripts start"
	}
}
```

### WordPress Dependencies

This package uses the [Dependency Extraction Webpack Plugin](https://www.npmjs.com/package/@wordpress/dependency-extraction-webpack-plugin) to extract wordpress dependencies. It does two things:
* Externalize dependencies that are available as script dependencies on modern WordPress sites.
* Add an asset file for each entry point that declares an object with the list of WordPress script dependencies for the entry point. The asset file also contains the current version calculated for the current source code.

This plugin is enabled by default with default configuration but can be easyli turned off by passing `--no-deps` flag to your build script:
``` json
{
	"scripts": {
		"build": "mp-scripts build --no-deps",
	}
}
```

If you need to use this plugin with other configuration (for example you want it to generate `json` files instead `php` - see the plugin's documentation) you can extend webpack config. See [Advanced Usage](https://www.npmjs.com/package/@micropackage/scripts#%EF%B8%8F-advanced-usage) for more information.

### Using WordPress Dependencies

Let's assume we are creating a Gutenberg block. We want to import `Component` class and some Gutenberg components to use in our block. Entry file would be `custom-block.js`:
```javascript
import { Component } from '@wordpress/element';
import { Button, CheckboxControl } from '@wordpress/components';

...
```

While running `mp-scripts build` command the [Dependency Extraction Webpack Plugin](https://www.npmjs.com/package/@wordpress/dependency-extraction-webpack-plugin) will create additional php file containing an object with dependencies list and asset version. Note, that there is also no need to add imported packages to your `package.json` - since they are being externalized you don't need them in `node_modules`.
The output files for this scenario are:
* `custom-block.js`
* `custom-block.asset.php`

Both files are located in the output directory.
The php file will have the following content:
```php
<?php return array('dependencies' => array('wp-components', 'wp-element', 'wp-polyfill'), 'version' => 'e7e3b282b35389ecd440edc71e073e5d');
```
Note that `version` will change if your source changes.

Here is a simple example of usage:
```php
<?php
add_action( 'enqueue_block_editor_assets', function() {
	$dir        = plugin_dir_path( __FILE__ );
	$src        = "{$dir}/dist/custom-block.js";
	$asset_file = "{$dir}/dist/custom-block.asset.php";

	if ( file_exists( $src ) && file_exists( $asset_file ) ) {
		$asset_info = require $asset_file;

		wp_enqueue_script(
			'custom-block',
			$src,
			$asset_info['dependencies'],
			$asset_info['version'],
			true
		);
	}
} );
```

## 📜 Available Scripts

### `build`
Uses [webpack](https://webpack.js.org/) to transform your code. The default [webpack](https://webpack.js.org/) configuration scans entry directory and uses each file as an entry point. It is also possible to use css/scss files as entry points. Using [MiniCssExtractPlugin](https://github.com/[webpack](https://webpack.js.org/)-contrib/mini-css-extract-plugin) and a custom plugin for asset cleanup this will emit only css file for css/scss etry.
All the params passed to this script will be passed forward to [webpack](https://webpack.js.org/). There are also params specific for this script:

| Parameter        | Default Value | Description                                                                                              |
|------------------|---------------|----------------------------------------------------------------------------------------------------------|
| **--entry-dir**  | 'src/assets'  | Directory in which to look for entries.                                                                  |
| **--output-dir** | 'dist'        | Output directory.<br/>_**Note:** this is not the same as [webpack](https://webpack.js.org/)'s `--output-path`. See examples below._ |
| **--js-dir**     | 'js'          | Scripts dir inside `--entry-dir`                                                                         |
| **--style-dir**  | 'scss'        | Style dir inside `--entry-dir`                                                                           |

*Example:*
```json
{
	"scripts": {
		"build": "mp-scripts build",
		"build:dev": "mp-scripts build --mode=development",
		"build:custom": "mp-scripts build entry-one.js entry-two.js --output-path=custom",
		"build:other": "mp-scripts build --entry-dir=other/src --output-dir=other/dist --js-dir=scripts --style-dir=styles"
	}
}
```
How to use it:
- `yarn build` - builds the code for production using entries from `src/assets/js` and `src/assets/scss`. Only files located directly in this folders will be used. All file names starting with `_` (underscore) are skipped. Output files will be placed inside `dist/js` and `dist/css` directories
- `yarn build:custom` - builds the code for production with two entry points and a custom output folder. Paths for custom entry points are relative to the project root.
- `yarn build:other` - this will work like the default build, but will look for entries inside `other/src/scripts` and `other/src/styles` directories. Output files will be placed inside `other/dist/scripts` and `other/dist/styles`.

#### Mode

By default `build` script will work in production mode. There are two ways to use another mode:
* by adding `--mode` argument to your command
* by setting NODE_ENV variable

### `lint-js`
Lints your code using [eslint](https://eslint.org/).
Default linting ruleset is [@wordpress/eslint-plugin/recommended](https://www.npmjs.com/package/@wordpress/eslint-plugin). This can be overwriten by placing an [eslint](https://eslint.org/) config file in your project or specifing `eslintConfig` field in a `package.json`.

*Example:*
```json
{
	"scripts": {
		"lint:js": "mp-scripts lint-js",
		"fix:js": "mp-scripts lint-js --fix",
		"lint:js:src": "mp-scripts lint-js ./src"
	}
}
```

How to use it:
- `yarn lint:js` - lints JavaScript files in the entire project’s directories.
- `yarn lint:js:src` - lints JavaScript files in the project’s src subfolder’s directories.

By default, files located in `dist`, `vendor` and `node_modules` folders are ignored.

### `lint-style`
Uses [stylelint](https://stylelint.io/) to lint your style files.

*Example:*
```json
{
	"scripts": {
		"lint:style": "mp-scripts lint-style",
		"fix:style": "mp-scripts lint-style --fix",
		"lint:css:src": "mp-scripts lint-style 'src/**/*.css'"
	}
}
```
How to use it:
- `yarn lint:style` - lints CSS and SCSS files in the entire project’s directories.
- `yarn lint:css:src` - lints only CSS files in the project’s src subfolder’s directories.

By default, files located in `dist`, `vendor` and `node_modules` folders are ignored.

### `start`
This script works exactly like `build` but configured for development. It will also automatically rebuild if the code will change. All the params work the same as in `build` script.

*Example:*
```json
{
    "scripts": {
        "start": "mp-scripts start",
        "start:custom": "mp-scripts start --entry-dir=custom/src --output-dir=custom/build"
    }
}
```

## 🕵️ Advanced Usage

This package ships with default config files for [eslint](https://eslint.org/), [stylelint](https://stylelint.io/) and [webpack](https://webpack.js.org/). Each config file can be overriden in your project.

### Extending webpack config

To extend default [webpack](https://webpack.js.org/) config you can provide your own `webpack.config.js` file and `require` the provided `webpack.config.js` file. You can use spread operator to import parts of the config.

In the example below a webpack.config.js file is added to the root folder extending the provided [webpack](https://webpack.js.org/) config to include [url-loader](https://github.com/webpack-contrib/url-loader) for images:
```javascript
const defaultConfig = require( "@micropackage/scripts/config/webpack.config" );

module.exports = {
	...defaultConfig,
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.(png|jpg|gif)$/i,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
							name: '[name].[ext]',
							outputPath: 'images',
						},
					},
				],
			},
		],
	},
};
```

### Run scripts in parallel or sequential

There are separate scripts to lint js and (s)css files, but it would be nice to have a single task to lint both. It can be accomplished using external modules, e.g. [npm-run-all](https://github.com/mysticatea/npm-run-all).
Using this module ypu can define scripts which will run other scripts in parallel or sequential using `run-p` or `run-s` commands.
```json
{
	"scripts": {
		"lint:style": "mp-scripts lint-style",
		"lint:js": "mp-scripts lint-js",
		"fix:style": "mp-scripts lint-style --fix",
		"fix:js": "mp-scripts lint-js --fix",
		"lint": "run-p \"lint:*\"",
		"lint:fix": "run-p \"fix:*\"",
	}
}
```
With the above config in your `package.json` you can run:
* `yarn lint` - to run both `lint:style` and `lint:js` in parallel
* `yarn lint:fix` - to run both `fix:style` and `fix:js` in parallel

## 📦 About the Micropackage project

Micropackages - as the name suggests - are micro packages with a tiny bit of reusable code, helpful particularly in WordPress development.

The aim is to have multiple packages which can be put together to create something bigger by defining only the structure.

Micropackages are maintained by [BracketSpace](https://bracketspace.com).

## 📖 Changelog

[See the changelog file](./CHANGELOG.md).

## 📃 License

GNU General Public License (GPL) v3.0. See the [LICENSE](./LICENSE) file for more information.
