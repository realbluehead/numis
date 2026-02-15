export interface Tag {
  category: string;
  value: string;
}

export interface Coin {
  id: string;
  reference?: string;
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
