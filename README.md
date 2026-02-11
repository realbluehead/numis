# NUMISMATECA - Colección de Monedas Antiguas

Una aplicación Angular 20 con Tailwind CSS para gestionar y visualizar una colección de monedas antiguas. Diseño moderno con paleta de terciopelos azules suaves.

## Características

✨ **Estética Moderna Sofisticada**: Diseño limpio centrado en colores azules suaves (terciopelo), tipografía moderna y espacios generosos

📋 **Gestión Completa CRUD**:

- Crear nuevas monedas
- Editar monedas existentes
- Eliminar monedas de la colección
- Visualización en galería estilo museo

🏷️ **Sistema de Etiquetas Dinámico**:

- Añadir múltiples categorías de tags (País, Año, Metal, etc.)
- Valores personalizados por categoría
- Visualización jerárquica de etiquetas

🔍 **Filtrado Avanzado**:

- Lógica AND: Las monedas deben coincidir con TODOS los filtros seleccionados
- Toggles por categoría y valor
- Limpieza rápida de filtros

🖼️ **Galería Museo**:

- Visualización en cuadrícula responsive
- Soporte para múltiples imágenes por moneda
- Indicadores de imágenes adicionales

💾 **Persistencia de Datos**:

- Almacenamiento automático en localStorage
- Sincronización en tiempo real con Signals
- Import/Export en JSON

## Estructura del Proyecto

```
src/
├── app/                      # Componente raíz
├── models/                   # Interfaces y tipos
│   └── coin.model.ts        # Modelo Coin y Tag
├── services/                 # Lógica de negocio
│   └── coin.store.ts        # Estado con Signals
├── components/              # Componentes Angular
│   ├── gallery/             # Visualización en galería
│   ├── filters/             # Panel de filtros
│   └── form/                # Formulario CRUD
├── styles.css               # Estilos globales con Tailwind
└── main.ts                  # Punto de entrada

public/                       # Archivos estáticos
dist/                         # Build de producción
```

## Tecnologías

- **Angular 20**: Framework frontend moderno
- **Signals**: Gestión de estado reactivo (zoneless)
- **Tailwind CSS 3**: Utilidades CSS para estilos
- **TypeScript**: Tipado estricto
- **localStorage**: Persistencia de datos

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Build Producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/numis/`

## Uso

### Añadir Moneda

1. Ve a la pestaña "Nueva Moneda"
2. Añade URLs de imágenes (máximo 2)
3. Define etiquetas (categoría + valor)
4. Haz clic en "Crear Moneda"

### Filtrar Monedas

1. En el panel lateral "Filtros"
2. Selecciona checkboxes de categorías y valores
3. Las monedas se filtran automáticamente (lógica AND)
4. Usa "Limpiar todos" para resetear

### Editar Moneda

1. En la galería, haz clic en "Editar"
2. Modifica datos e imágenes
3. Haz clic en "Actualizar Moneda"

### Importar/Exportar

- **Exportar**: Descarga JSON de todas las monedas
- **Importar**: Carga JSON previamente exportado
- **Limpiar**: Elimina todos los datos (con confirmación)

## Modelo de Datos

```typescript
interface Coin {
  id: string;
  images: string[]; // URLs de imágenes
  tags: Tag[]; // Etiquetas personalizadas
  createdAt?: Date;
  updatedAt?: Date;
}

interface Tag {
  category: string; // Ej: "País", "Año"
  value: string; // Ej: "España", "1850"
}
```

## Características Técnicas

- ✅ Componentes standalone sin módulos
- ✅ Signals para estado reactivo (zoneless)
- ✅ `inject()` para inyección de dependencias
- ✅ `@if` y `@for` para control de flujo
- ✅ localStorage con sincronización automática
- ✅ Responsive design (mobile-first)
- ✅ Validación de entrada en formularios
- ✅ Confirmaciones antes de acciones destructivas

## Paleta de Colores - Terciopelo Azul Moderno

| Elemento          | Color          | Clase Tailwind      |
| ----------------- | -------------- | ------------------- |
| Fondo Principal   | Blanco Crema   | `bg-white`          |
| Fondo Secundario  | Azul Muy Claro | `bg-velvet-50`      |
| Acentos Primarios | Azul Profundo  | `bg-velvet-600`     |
| Acentos Suaves    | Azul Claro     | `bg-velvet-300`     |
| Bordes            | Azul Medio     | `border-velvet-300` |
| Texto Principal   | Azul Oscuro    | `text-velvet-900`   |
| Sombras           | Azul 15%       | `shadow-soft`       |

---

**Última actualización**: 11 de Febrero de 2026
