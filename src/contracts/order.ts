export enum OrderType {
    SALE = 'sale',
    RESTOCK = 'restock',
}

export interface Order {
    productId: string;
    customerId: string;
    dateOrdered: string;
    purchaseLocation: string;
    datePaid: string | null;
    productName: string;
    orderType: OrderType;
    quantity: number;
    cost: number;
    revenue: number;
    profit: number;
    value: number;
}

export type ProductOrder = Omit<
    Order,
    'cost' | 'productId' | 'customerId' | 'value'
>;
export type CustomerOrder = Omit<
    Order,
    | 'purchaseLocation'
    | 'orderType'
    | 'cost'
    | 'productId'
    | 'customerId'
    | 'value'
>;
export type RestockOrder = Omit<
    Order,
    | 'datePaid'
    | 'orderType'
    | 'revenue'
    | 'profit'
    | 'productId'
    | 'customerId'
    | 'value'
>;

export interface DateOrder {
    customerName: string;
    details: string;
    revenue: number;
}
