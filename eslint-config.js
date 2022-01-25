module.exports = {
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
	parserOptions: {
		requireConfigFile: false,
	},
	rules: {
		'prettier/prettier': [
			'error',
			{
				useTabs: true,
				tabWidth: 4,
				printWidth: 80,
				singleQuote: true,
				trailingComma: 'es5',
				bracketSpacing: true,
				parenSpacing: false,
				bracketSameLine: false,
				semi: true,
				arrowParens: 'always',
			},
		],
	},
};
