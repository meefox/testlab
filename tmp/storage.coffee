# license Copyright (c) 2014. All rights reserved.
# author Yuriy Sinyaev, meefox@gmail.com
# name Storage
# version 1.0
# description Resource preloader for Three.js based projects

class juv.Storage
	constructor: ( config ) ->
		@config = config
		@textures = {}
		@geometries = {}
		@materials = {}
		@progress = 0

		@init()

		@

	loadComplete: () ->
		console.log( 'loadComplete' )
		event = new CustomEvent('StorageComplete', { 'detail': { 'complete': true } })
		window.dispatchEvent( event )

		@

	loaded: ( resource, name ) ->
		@progress--
		console.log( 'loaded, left:', @progress )

		if @progress is 0
			@loadComplete()

		@

	loadTexture: ( name, pathToFile ) ->
		console.log( "loadTexture:", name, pathToFile )
		@textures[name] = new THREE.ImageUtils.loadTexture( pathToFile, false, @loaded.bind( @ ) )

		@

	loadGeometry: ( name, pathToFile ) ->
		console.log("loadGeometry:",name, pathToFile)
		@geometries[name] = new THREE.JSONLoader( true ).load(pathToFile, @loaded.bind( @ ) )

		@

	load: () ->
		textures = @config.resources.textures
		for texture of textures
			@loadTexture( texture, textures[texture] )

		geometries = @config.resources.geometries
		for geometry of geometries
			@loadGeometry( geometry, geometries[geometry] )

		@


	init: () ->
		for resource of @config.resources
			for data of @config.resources[resource]
				@progress++

		@load()

		@