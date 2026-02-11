# Guía de Uso - NUMISMATECA

## Inicio Rápido

### 1. Crear tu Primera Moneda

1. **Accede a "Nueva Moneda"** en el header
2. **Campos obligatorios**:
   - Imagen 1: URL válida (ej: `https://example.com/coin.jpg`)
   - Imagen 2: Opcional
3. **Añade Etiquetas**:
   - Categoría: `País`
   - Valor: `España`
   - Haz clic en "+ Añadir Etiqueta"
4. **Repite** con más etiquetas (Año, Metal, etc.)
5. **Haz clic en "Crear Moneda"**

### 2. Visualizar Galería

1. **Ve a "Galería"** en el header
2. Verás todas tus monedas en una cuadrícula
3. Cada moneda muestra:
   - Primera imagen
   - Todas las etiquetas
   - Botones: Editar / Eliminar

### 3. Filtrar Monedas

1. **Panel Lateral "Filtros"** (automático en desktop)
2. Selecciona checkboxes de categorías
3. **Lógica AND**: La moneda debe tener TODOS los filtros activos
4. **Ejemplo**: Si activas "España" + "Oro", solo verás monedas españolas DE ORO
5. Usa "Limpiar todos" para resetear

### 4. Editar Moneda

1. **En la galería**, haz clic en "Editar"
2. **El formulario se carga** con los datos actuales
3. **Modifica** lo que necesites
4. Haz clic en "Actualizar Moneda"
5. O "Cancelar" para descartar cambios

### 5. Exportar/Importar

#### Exportar

- Haz clic en **"⬇ Exportar"** en el header
- Se descarga automáticamente `numis-export-FECHA.json`
- Contiene TODAS tus monedas

#### Importar

- Haz clic en **"⬆ Importar"** en el header
- Selecciona un archivo `.json` previamente exportado
- Se importan TODAS las monedas
- Sobrescribe los datos existentes

## Consejos Prácticos

### Etiquetas Efectivas

**Recomendadas por categoría**:

- **País**: España, Italia, Francia, Imperio Romano, etc.
- **Año/Período**: 1850, Siglo XVI, Época Medieval, Augusto, etc.
- **Metal**: Oro, Plata, Cobre, Bronce, etc.
- **Tipo**: Moneda, Medalla, Jeton, etc.
- **Estado**: Excelente, Bueno, Regular, etc.

**Ejemplo completo**:

- País: España
- Año: 1885
- Metal: Plata
- Tipo: Moneda
- Módulo: 20mm

### URLs de Imágenes

Usa URLs públicas que sean accesibles:

- ✅ URLs directas (terminan en .jpg, .png, etc.)
- ✅ Servicios como Unsplash, Pexels
- ❌ URLs con restricciones de acceso
- ❌ Archivos locales sin servidor

### Búsqueda por Filtros

**Combina múltiples filtros**:

1. Selecciona País: "España"
2. Selecciona Metal: "Oro"
3. El filtro muestra solo monedas españolas de oro

**Nota**: Es lógica AND, no OR

- "España" + "Francia" = NINGUNA (no puede ser ambas)
- "España" + "Plata" = Monedas españolas de plata

## Datos se Guardan Automáticamente

✅ Cada cambio se guarda en `localStorage`
✅ Los datos persisten entre sesiones
✅ No necesitas guardar manualmente

## Copias de Seguridad

1. **Exporta regularmente**:
   - Haz clic en "⬇ Exportar"
   - Guarda el archivo en disco
2. **Para restaurar**:
   - Haz clic en "⬆ Importar"
   - Selecciona el archivo anterior

## Limpiar Todo

⚠️ **Cuidado**: Esta acción es irreversible

1. Haz clic en "🗑 Limpiar"
2. Confirma en el diálogo
3. Se eliminan TODAS las monedas

Recomendación: **Exporta primero** antes de limpiar.

## Responsive Design

- **Desktop**: Panel de filtros a la lado
- **Tablet**: Panel colapsa cuando es necesario
- **Móvil**: Vista stack (vertical)

## Atajos y Tips

| Acción          | Atajo                             |
| --------------- | --------------------------------- |
| Nueva Moneda    | Pestaña "Nueva Moneda" del header |
| Galería         | Pestaña "Galería" del header      |
| Filtrar         | Panel lateral automático          |
| Exportar        | Botón "⬇ Exportar"                |
| Importar        | Botón "⬆ Importar"                |
| Limpiar Filtros | "Limpiar todos" en panel          |

---

¿Preguntas? Revisa la sección técnica en README.md
