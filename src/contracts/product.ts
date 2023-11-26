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
    volume: string;
}

export type CustomerProduct = Pick<
    Product,
    'productId' | 'productName' | 'sellingPrice' | 'stockLevel' | 'volume'
>;

export type ProductPreview = Pick<
    Product,
    'productId' | 'productName' | 'stockLevel' | 'sellingPrice'
>;

export type ProductRequest = Omit<Product, 'productId'>;

export type FavouriteProduct = Pick<Product, 'productName' | 'totalRevenue'>;

export enum ProductRequestColumnMapping {
    'productName' = 'product_name',
    'stockLevel' = 'stock_level',
    'unitCost' = 'unit_cost',
    'sellingPrice' = 'selling_price',
    'wholesalePrice' = 'wholesale_price',
    'totalValue' = 'total_value',
    'totalOrders' = 'total_orders',
    'totalCost' = 'total_cost',
    'totalRevenue' = 'total_revenue',
    'totalProfit' = 'total_profit',
    'volume' = 'volume',
}
