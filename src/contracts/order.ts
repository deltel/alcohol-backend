export enum OrderType {
    SALE = 'sale',
    RESTOCK = 'restock',
}

export interface Order {
    dateOrdered: string;
    purchaseLocation: string;
    datePaid: string | null;
    productName: string;
    orderType: OrderType;
    quantity: number;
    cost: number;
    revenue: number;
    profit: number;
}

export type ProductOrder = Omit<Order, 'cost'>;
export type CustomerOrder = Omit<
    Order,
    'purchaseLocation' | 'orderType' | 'cost'
>;
export type RestockOrder = Omit<
    Order,
    'datePaid' | 'orderType' | 'revenue' | 'profit'
>;

export interface DateOrder {
    customerName: string;
    details: string;
    revenue: number;
}
