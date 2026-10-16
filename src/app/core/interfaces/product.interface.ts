
export interface ProductSpecification {
  specificationId: string;
  name: string;
  value: string;
}

export interface Product {
  _id?: string;
  name: string;
  category: string;
  brand: string;
  model?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  warranty?: string;
  description?: string;
  image?: string;
  isActive?: boolean;

  specifications?: ProductSpecification[];
}
