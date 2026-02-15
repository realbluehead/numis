import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export type Language = 'ca' | 'es' | 'en';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private currentLanguage = signal<Language>('ca');
  language = this.currentLanguage.asReadonly();

  private translations: Translations = {
    // Header
    'header.title': {
      ca: 'NUMIS',
      es: 'NUMIS',
      en: 'NUMIS',
    },
    'header.export': {
      ca: 'Exportar',
      es: 'Exportar',
      en: 'Export',
    },
    'header.import': {
      ca: 'Importar',
      es: 'Importar',
      en: 'Import',
    },
    'header.clear': {
      ca: 'Netejar',
      es: 'Limpiar',
      en: 'Clear',
    },
    'header.newCoin': {
      ca: 'Afegir Exemplar',
      es: 'Añadir Ejemplar',
      en: 'New Coin',
    },
    'header.gallery': {
      ca: 'Galeria',
      es: 'Galería',
      en: 'Gallery',
    },
    'header.tags': {
      ca: 'Etiquetes',
      es: 'Etiquetas',
      en: 'Tags',
    },
    'header.saveLocal': {
      ca: 'Guardar Local',
      es: 'Guardar Local',
      en: 'Save Local',
    },
    'header.sync': {
      ca: 'Sincronitzar',
      es: 'Sincronizar',
      en: 'Sync',
    },
    'header.syncing': {
      ca: 'Sincronitzant...',
      es: 'Sincronizando...',
      en: 'Syncing...',
    },
    'header.lastSync': {
      ca: 'Última sincronització',
      es: 'Última sincronización',
      en: 'Last sync',
    },
    'header.neverSynced': {
      ca: 'Sense sincronitzar',
      es: 'Sin sincronizar',
      en: 'Never synced',
    },

    // Gallery
    'gallery.title': {
      ca: 'La meva col.lecció',
      es: 'Mi colección',
      en: 'My Collection',
    },
    'gallery.coinsCount': {
      ca: 'monedes',
      es: 'monedas',
      en: 'coins',
    },
    'gallery.noImage': {
      ca: 'Sense imatge',
      es: 'Sin imagen',
      en: 'No image',
    },
    'gallery.edit': {
      ca: 'Editar',
      es: 'Editar',
      en: 'Edit',
    },
    'gallery.delete': {
      ca: 'Eliminar',
      es: 'Eliminar',
      en: 'Delete',
    },
    'gallery.empty': {
      ca: 'No hi ha monedes a la colecció',
      es: 'No hay monedas en la colección',
      en: 'No coins in collection',
    },
    'gallery.emptyHint': {
      ca: 'Afegeix la teva primera moneda per començar',
      es: 'Añade tu primera moneda para comenzar',
      en: 'Add your first coin to get started',
    },
    'gallery.deleteConfirm': {
      ca: 'Estàs segur que vols eliminar aquesta moneda?',
      es: '¿Estás seguro de que deseas eliminar esta moneda?',
      en: 'Are you sure you want to delete this coin?',
    },

    // Filters
    'filters.title': {
      ca: 'Filtres',
      es: 'Filtros',
      en: 'Filters',
    },
    'filters.clearAll': {
      ca: 'Netejar tots',
      es: 'Limpiar todos',
      en: 'Clear all',
    },
    'filters.noTags': {
      ca: 'Afegeix monedes per veure filtres disponibles',
      es: 'Añade monedas para ver filtros disponibles',
      en: 'Add coins to see available filters',
    },
    'filters.activeFilters': {
      ca: 'Filtres actius (lògica AND):',
      es: 'Filtros activos (lógica AND):',
      en: 'Active filters (AND logic):',
    },
    'filters.physicalTitle': {
      ca: 'Característiques Físiques',
      es: 'Características Físicas',
      en: 'Physical Characteristics',
    },
    'filters.weight': {
      ca: 'Pes (g)',
      es: 'Peso (g)',
      en: 'Weight (g)',
    },
    'filters.diameter': {
      ca: 'Diàmetre (mm)',
      es: 'Diámetro (mm)',
      en: 'Diameter (mm)',
    },

    // Form
    'form.newCoin': {
      ca: 'Afegir Moneda Nova',
      es: 'Añadir Nueva Moneda',
      en: 'Add New Coin',
    },
    'form.editCoin': {
      ca: 'Editar Moneda',
      es: 'Editar Moneda',
      en: 'Edit Coin',
    },
    'form.reference': {
      ca: 'Referència',
      es: 'Referencia',
      en: 'Reference',
    },
    'form.imagesTitle': {
      ca: 'Imatges',
      es: 'Imágenes',
      en: 'Images',
    },
    'form.addImage': {
      ca: 'Afegir imatge',
      es: 'Añadir imagen',
      en: 'Add image',
    },
    'form.imageLabel': {
      ca: 'Imatge %index%',
      es: 'Imagen %index%',
      en: 'Image %index%',
    },
    'form.imagePlaceholder': {
      ca: 'https://exemple.com/imatge.jpg',
      es: 'https://ejemplo.com/imagen.jpg',
      en: 'https://example.com/image.jpg',
    },
    'form.image': {
      ca: 'Imatge',
      es: 'Imagen',
      en: 'Image',
    },
    'form.required': {
      ca: '(requerida)',
      es: '(requerida)',
      en: '(required)',
    },
    'form.validUrl': {
      ca: '✓ URL vàlida',
      es: '✓ URL válida',
      en: '✓ Valid URL',
    },
    'form.optional': {
      ca: '○ Opcional',
      es: '○ Opcional',
      en: '○ Optional',
    },
    'form.tagsTitle': {
      ca: 'Etiquetes',
      es: 'Etiquetas',
      en: 'Tags',
    },
    'form.addedTags': {
      ca: 'Etiquetes afegides:',
      es: 'Etiquetas añadidas:',
      en: 'Tags added:',
    },
    'form.remove': {
      ca: 'Treure',
      es: 'Quitar',
      en: 'Remove',
    },
    'form.addTag': {
      ca: 'Afegir etiqueta:',
      es: 'Añadir etiqueta:',
      en: 'Add tag:',
    },
    'form.tagCategoryPlaceholder': {
      ca: 'Ex: País, Any, Metal',
      es: 'Ej: País, Año, Metal',
      en: 'Ex: Country, Year, Metal',
    },
    'form.tagValuePlaceholder': {
      ca: 'Ex: Espanya, 1850, Or',
      es: 'Ej: España, 1850, Oro',
      en: 'Ex: Spain, 1850, Gold',
    },
    'form.submitAddTag': {
      ca: '+ Afegir Etiqueta',
      es: '+ Añadir Etiqueta',
      en: '+ Add Tag',
    },
    'form.descriptionsTitle': {
      ca: 'Descripcions',
      es: 'Descripciones',
      en: 'Descriptions',
    },
    'form.anvers': {
      ca: 'Anvers',
      es: 'Anverso',
      en: 'Obverse',
    },
    'form.revers': {
      ca: 'Revers',
      es: 'Reverso',
      en: 'Reverse',
    },
    'form.general': {
      ca: 'General',
      es: 'General',
      en: 'General',
    },
    'form.physicalTitle': {
      ca: 'Característiques Físiques',
      es: 'Características Físicas',
      en: 'Physical Characteristics',
    },
    'form.weight': {
      ca: 'Pes (g)',
      es: 'Peso (g)',
      en: 'Weight (g)',
    },
    'form.weightPlaceholder': {
      ca: 'Ex: 5.5',
      es: 'Ej: 5.5',
      en: 'E.g: 5.5',
    },
    'form.diameter': {
      ca: 'Diàmetre (mm)',
      es: 'Diámetro (mm)',
      en: 'Diameter (mm)',
    },
    'form.diameterPlaceholder': {
      ca: 'Ex: 25.5',
      es: 'Ej: 25.5',
      en: 'E.g: 25.5',
    },
    'form.acquisitionTitle': {
      ca: 'Adquisició',
      es: 'Adquisición',
      en: 'Acquisition',
    },
    'form.addedToCollectionAt': {
      ca: 'Data d\'adquisició',
      es: 'Fecha de adquisición',
      en: 'Acquisition date',
    },
    'form.pricePaid': {
      ca: 'Preu pagat (€)',
      es: 'Precio pagado (€)',
      en: 'Price paid (€)',
    },
    'form.pricePaidPlaceholder': {
      ca: 'Ex: 25.50',
      es: 'Ej: 25.50',
      en: 'E.g: 25.50',
    },
    'form.submitCreate': {
      ca: 'Afegir Moneda',
      es: 'Añadir Moneda',
      en: 'Add Coin',
    },
    'form.submitUpdate': {
      ca: 'Actualitzar Moneda',
      es: 'Actualizar Moneda',
      en: 'Update Coin',
    },
    'form.cancel': {
      ca: 'Cancelar',
      es: 'Cancelar',
      en: 'Cancel',
    },
    'form.errorImage': {
      ca: 'Si us plau, afegeix almenys una imatge',
      es: 'Por favor, añade al menos una imagen',
      en: 'Please add at least one image',
    },
    'form.import': {
      ca: 'Importar dades',
      es: 'Importar datos',
      en: 'Import data',
    },
    'form.importPlaceholder': {
      ca: 'Enganxa dades (tab-separated)',
      es: 'Pega datos (tab-separados)',
      en: 'Paste data (tab-separated)',
    },

    // Messages
    'message.importSuccess': {
      ca: 'Dades importades correctament',
      es: 'Datos importados correctamente',
      en: 'Data imported successfully',
    },
    'message.importError': {
      ca: 'Error: Format de fitxer invàlid',
      es: 'Error: Formato de archivo inválido',
      en: 'Error: Invalid file format',
    },
    'message.clearConfirm': {
      ca: 'Estàs segur? Això eliminarà TOTES les monedes de forma permanent.',
      es: '¿Estás seguro? Esto eliminará TODAS las monedas de forma permanente.',
      en: 'Are you sure? This will permanently delete ALL coins.',
    },
    'message.syncLocalSuccess': {
      ca: 'Saved to local PouchDB successfully',
      es: 'Guardado en PouchDB local con éxito',
      en: 'Saved to local PouchDB successfully',
    },
    'message.syncServerSuccess': {
      ca: 'Synced with CouchDB successfully',
      es: 'Sincronizado con CouchDB con éxito',
      en: 'Synced with CouchDB successfully',
    },

    // Language selector
    'language.selector': {
      ca: 'Idioma',
      es: 'Idioma',
      en: 'Language',
    },

    // Tag Manager
    'tagManager.title': {
      ca: "Gestor d'Etiquetes",
      es: 'Gestor de Etiquetas',
      en: 'Tag Manager',
    },
    'tagManager.count': {
      ca: 'etiquetes',
      es: 'etiquetas',
      en: 'tags',
    },
    'tagManager.addTitle': {
      ca: 'Afegir etiqueta',
      es: 'Añadir etiqueta',
      en: 'Add tag',
    },
    'tagManager.categoryPlaceholder': {
      ca: 'Categoria',
      es: 'Categoría',
      en: 'Category',
    },
    'tagManager.valuePlaceholder': {
      ca: 'Valor',
      es: 'Valor',
      en: 'Value',
    },
    'tagManager.addButton': {
      ca: '+ Afegir Etiqueta',
      es: '+ Añadir Etiqueta',
      en: '+ Add Tag',
    },
    'tagManager.edit': {
      ca: 'Editar',
      es: 'Editar',
      en: 'Edit',
    },
    'tagManager.delete': {
      ca: 'Eliminar',
      es: 'Eliminar',
      en: 'Delete',
    },
    'tagManager.save': {
      ca: 'Guardar',
      es: 'Guardar',
      en: 'Save',
    },
    'tagManager.cancel': {
      ca: 'Cancelar',
      es: 'Cancelar',
      en: 'Cancel',
    },
    'tagManager.noTags': {
      ca: 'No hi ha etiquetes',
      es: 'No hay etiquetas',
      en: 'No tags',
    },
    'tagManager.noTagsHint': {
      ca: 'Afegeix la primera etiqueta per començar',
      es: 'Añade la primera etiqueta para comenzar',
      en: 'Add the first tag to get started',
    },
    'tagManager.export': {
      ca: '⬇ Exportar',
      es: '⬇ Exportar',
      en: '⬇ Export',
    },
    'tagManager.import': {
      ca: '⬆ Importar',
      es: '⬆ Importar',
      en: '⬆ Import',
    },
    'tagManager.clearAll': {
      ca: '🗑 Netejar tots',
      es: '🗑 Limpiar todos',
      en: '🗑 Clear all',
    },
    'tagManager.deleteConfirm': {
      ca: 'Estàs segur que vols eliminar aquesta etiqueta?',
      es: '¿Estás seguro de que deseas eliminar esta etiqueta?',
      en: 'Are you sure you want to delete this tag?',
    },
    'tagManager.clearConfirm': {
      ca: 'Estàs segur que vols eliminar TOTES les etiquetes?',
      es: '¿Estás seguro de que deseas eliminar TODAS las etiquetas?',
      en: 'Are you sure you want to delete ALL tags?',
    },
    'tagManager.importSuccess': {
      ca: 'Etiquetes importades correctament',
      es: 'Etiquetas importadas correctamente',
      en: 'Tags imported successfully',
    },
    'tagManager.tabs': {
      ca: '🏷 Etiquetes',
      es: '🏷 Etiquetas',
      en: '🏷 Tags',
    },
  };

  constructor() {
    const saved = localStorage.getItem('numis-language');
    if (saved && ['ca', 'es', 'en'].includes(saved)) {
      this.currentLanguage.set(saved as Language);
    }
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    localStorage.setItem('numis-language', lang);
  }

  t(key: string): string {
    const lang = this.currentLanguage();
    return this.translations[key]?.[lang] ?? key;
  }

  getLanguages(): { code: Language; name: string }[] {
    return [
      { code: 'ca', name: 'Català' },
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
    ];
  }
}
