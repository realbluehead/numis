export interface Tag {
  category: string;
  value: string;
}

export interface Coin {
  id: string;
  images: string[];
  tags: Tag[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type CoinInput = Omit<Coin, 'id' | 'createdAt' | 'updatedAt'>;
