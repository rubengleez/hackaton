# TAPP · demo móvil

Prototipo funcional de **Tapp**, una app de inspiración y compra de looks donde se toca cada prenda para descubrirla, adaptarla al presupuesto y guardarla.

La demo está pensada para **390 px de ancho** y también se puede abrir en escritorio: verás el móvil enmarcado sobre una portada editorial.

## Ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Build de producción:

```bash
npm run build
npm run preview
```

## Recorrido de demo (2–3 minutos)

1. **Feed**: alterna **main** y **following**. Desliza los looks y toca los **puntos blancos** sobre la ropa.
2. **Isla de prenda**: al tocar un punto aparece la isla flotante con marca, precio, color y enlace a la tienda.
3. **Ajustar a presupuesto**: desde la isla, abre alternativas de esa prenda por menos dinero. Los chips de precio cambian la búsqueda.
4. **Lo quiero**: guarda la prenda con talla, color y nota.
5. **Buscar**: prueba `zapatillas`. Los outfits siguen mostrando el look completo y, al abrirlo, la prenda buscada aparece destacada.
6. **Guardados**: separa **Inspiración** (looks completos) de **Lo quiero** (prendas exactas). La lista puede hacerse pública o privada.
7. **Publicar**: sube una foto o usa una de demo, añade prendas del catálogo o pega el enlace de una tienda, etiqueta sobre la foto y publica.
8. **Perfil**: looks, inspiración, wishlist y reinicio de la demo.
9. **Mensajes**: comparte un look como tarjeta dentro de una conversación.

## Funcionalidades incluidas

- Feed vertical full-screen con pestañas Para ti / Siguiendo, scroll snap y puntos interactivos sobre cada prenda.
- Interfaz despejada: sin títulos ni métricas en el feed; toda la información aparece al tocar un punto.
- Isla flotante con información de la prenda y acciones de presupuesto y wishlist.
- Motor de presupuesto por prenda y por look completo, con alternativas de un catálogo propio.
- Buscador con pestañas de outfits, prendas y personas/marcas, filtros de categoría, estilo, ocasión y presupuesto.
- Publicación de looks con foto, descripción, prendas, etiquetas sobre la imagen, estilo y ocasión.
- Inspiración vs. Lo quiero, con talla, color, nota, privacidad y enlace compartible.
- Perfil editable, follows, guardados y wishlist.
- Mensajes individuales con tarjetas de outfits.
- Drops de marcas y sección «Así lo lleva la comunidad».
- Persistencia en `localStorage` y botón de reinicio en el perfil.

## Notas del prototipo

- No hay backend: el estado vive en el navegador. El botón **Reiniciar** del perfil vuelve a los datos iniciales.
- Las fotos son de Unsplash y se sirven desde `public/images`.
- Los enlaces de tienda apuntan a búsquedas reales en Zara, Mango, COS, Uniqlo, Nike, etc.
- El enlace para compartir es simulado (`tapp.app/...`), pero la tarjeta del look sí se envía dentro de la demo.
- El catálogo es pequeño y deliberadamente controlado para que la demo sea rápida y explicable.
