export interface Product {
    productId: string;
    productName: string;
    stockLevel: number;
    unitCost: number;
    sellingPrice: number;
    wholesalePrice: number;
    totalValue: number;
    totalOrders: number;
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
}

export type ProductSummary = Omit<
    Product,
    'unitCost' | 'sellingPrice' | 'wholesalePrice'
>;

export type ProductPreview = Pick<
    Product,
    'productId' | 'productName' | 'stockLevel'
>;

export type FavouriteProduct = Pick<Product, 'productName' | 'totalRevenue'>;
