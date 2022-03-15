module.exports = {
	extends: [
		'stylelint-config-recommended',
		'stylelint-config-recommended-scss',
	],
	plugins: ['stylelint-order'],
	rules: {
		'at-rule-empty-line-before': [
			'always',
			{
				ignore: ['after-comment', 'first-nested'],
				except: ['blockless-after-same-name-blockless'],
				ignoreAtRules: ['else'],
			},
		],
		'color-named': [
			'never',
			{
				ignore: ['inside-function'],
			},
		],
		'function-no-unknown': null, // This rule doesn't work well with sass functions.
		'function-url-quotes': 'always',
		'order/order': ['custom-properties', 'declarations', 'rules'],
		'order/properties-alphabetical-order': true,
		'rule-empty-line-before': [
			'always',
			{
				ignore: ['after-comment', 'first-nested'],
			},
		],
	},
};
