// Imagenes Unsplash verificadas (HTTP 200 + revision visual) el 2026-06-10.
// TODO(brand): reemplazar por fotografia propia de la finca/cafeteria del cliente.

const u = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMG = {
  heroFog: u('1448375240586-882707db888b', 2000),
  beansSack: u('1524350876685-274059332603', 1200),
  pourOver: u('1442512595331-e89e73853f31', 1200),
  flatLay: u('1497935586351-b67a49e012bf', 1200),
  cupTop: u('1514432324607-a09d9b4aefdd', 900),
  equipment: u('1611854779393-1b2da9d400fe', 1200),
  bagWhite: u('1559056199-641a0ac8b55e', 900),
  beansMacro: u('1447933601403-0c6688de566e', 1200),
  barista: u('1509042239860-f550ce710b93', 1200),
  espresso: u('1498804103079-a6351b050096', 900),
}
