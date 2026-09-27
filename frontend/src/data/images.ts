// Fotografías de café hondureño para Directo Café.
// Optimizadas en public/marca/. Las claves historicas se conservan para no
// romper consumidores; apuntan ahora a la foto real mas adecuada.

const M = (name: string) => `/marca/${name}`

export const IMG = {
  // Claves historicas (mapeadas a la foto real equivalente)
  heroFog: M('barista-marca.jpg'),
  beansSack: M('granos.jpg'),
  pourOver: M('barista-latte.jpg'),
  flatLay: M('cupping-tazas.jpg'),
  cupTop: M('capuccinos.jpg'),
  equipment: M('bolsas-estante.jpg'),
  bagWhite: M('bolsa-blend.jpg'),
  beansMacro: M('granos.jpg'),
  barista: M('barista-latte.jpg'),
  espresso: M('espresso.jpg'),

  // Fotos de marca
  baristaMarca: M('barista-marca.jpg'),
  baristaLatte: M('barista-latte.jpg'),
  granos: M('granos.jpg'),
  capuccinos: M('capuccinos.jpg'),
  mug: M('mug-marca.jpg'),
  cataCoE: M('catacion-coe.jpg'),
  cuppingSetup: M('cupping-setup.jpg'),
  cuppingTazas: M('cupping-tazas.jpg'),
  cuppingMesa: M('cupping-mesa.jpg'),
  bolsasEstante: M('bolsas-estante.jpg'),

  // Bolsas de producto
  bolsaBlend: M('bolsa-blend.jpg'),
  bolsaJosueGalo: M('bolsa-josuegalo.jpg'),
  bolsaNahun: M('bolsa-nahun.jpg'),
}
