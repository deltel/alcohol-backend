export interface Product {
    productId: string;
    productName: string;
    stockLevel: number;
    totalCost: number;
    totalOrders: number;
    totalProfit: number;
    totalRevenue: number;
    totalValue: number;
}

export type ProductPreview = Pick<
    Product,
    'productId' | 'productName' | 'stockLevel'
>;
