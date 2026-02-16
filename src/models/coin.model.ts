export interface Tag {
  category: string;
  value: string;
}

export interface Coin {
  id: string;
  reference?: string;
  /**
   * Array of image references.
   * Can be either:
   * - URLs (external or local)
   * - Local blob references starting with 'img_' (stored in ImageStore)
   * - Default image paths like '/nophoto.png'
   */
  images: string[];
  tags: string[];
  anvers?: string;
  revers?: string;
  general?: string;
  weight?: number;
  diameter?: number;
  seller?: string;
  addedToCollectionAt?: Date;
  pricePaid?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CoinInput = Omit<Coin, 'id' | 'createdAt' | 'updatedAt'>;
