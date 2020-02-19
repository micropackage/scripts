class RemoveSuprefluousAssetsPlugin {
	apply( compiler ) {
		compiler.hooks.emit.tapAsync( 'RemoveSuprefluousAssetsPlugin', ( compilation, callback ) => {
			for ( const namedChunk of compilation.namedChunks ) {
				const [ name, chunk ] = namedChunk;
				const resource = chunk.entryModule.resource;

				if ( resource && ( resource.endsWith( '.scss' ) || resource.endsWith( '.css' ) ) ) {
					const regexp = new RegExp( `${name}\.((?!css).)*$` );

					for ( const asset in compilation.assets ) {
						if ( asset.match( regexp ) ) {
							delete compilation.assets[ asset ];
						}
					}
				}
			}

			callback();
		}	);
	}
}

module.exports = RemoveSuprefluousAssetsPlugin;
