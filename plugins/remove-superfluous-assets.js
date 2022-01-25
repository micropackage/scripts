const { filter } = require('lodash');
const { sources, Compilation } = require('webpack');

class RemoveSuprefluousAssetsPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap(
			'RemoveSuprefluousAssetsPlugin',
			(compilation) => {
				compilation.hooks.processAssets.tap(
					{
						name: 'RemoveSuprefluousAssetsPlugin',
						stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
					},
					() => this.processAssets(compilation)
				);
			}
		);
	}

	processAssets(compilation) {
		const names = this.getSassAssetNames(compilation.assets);

		names.forEach((name) => this.filterAssets(compilation, name));
	}

	filterAssets(compilation, name) {
		const regex = new RegExp(
			`${name.substr(0, name.length - 4)}\\.((?!css).)*$`
		);

		Object.keys(compilation.assets)
			.filter((asset) => regex.test(asset))
			.forEach((asset) => compilation.deleteAsset(asset));
	}

	getSassAssetNames(assets) {
		return Object.keys(assets).filter((asset) => asset.endsWith('.css'));
	}
}

module.exports = RemoveSuprefluousAssetsPlugin;
