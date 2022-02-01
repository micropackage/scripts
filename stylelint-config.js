module.exports = {
	extends: [
		'stylelint-config-recommended',
		'stylelint-config-recommended-scss',
	],
	plugins: ['stylelint-order'],
	rules: {
		'order/order': ['custom-properties', 'declarations', 'rules'],
		'order/properties-alphabetical-order': true
	},
};
