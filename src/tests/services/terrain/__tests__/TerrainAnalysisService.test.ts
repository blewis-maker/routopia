  const area = {
    center: { latitude: 0, longitude: 0 },
    radius: 1000
  };

  const model = await terrainService.generate3DTerrainModel({
    center: { latitude: 0, longitude: 0 },
    radius: 1000
  });

  await expect(
    terrainService.generate3DTerrainModel({
      center: { latitude: 0, longitude: 0 },
      radius: 1000
    })
  ).rejects.toThrow('Failed to generate 3D terrain model');

  const location = { latitude: 0, longitude: 0 };

  await expect(
    terrainService.predictSurfaceQuality(
      { latitude: 0, longitude: 0 },
      {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      }
    )
  ).rejects.toThrow();

  const features = await terrainService.analyzeTerrainFeatures({
    center: { latitude: 0, longitude: 0 },
    radius: 2000
  }); 