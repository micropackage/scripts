module.exports = {
	extends: [
		'stylelint-config-recommended',
		'stylelint-config-recommended-scss',
	],
	plugins: ['stylelint-order'],
	rules: {
		'function-no-unknown': null, // This rule doesn't work well with sass functions.
		'order/order': ['custom-properties', 'declarations', 'rules'],
		'order/properties-alphabetical-order': true,
	},
};
