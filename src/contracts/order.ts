export enum OrderType {
    SALE = 'sale',
    RESTOCK = 'restock',
}

export interface Order {
    productId: string;
    userId: string;
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

export type OrderSummary = Pick<
    Order,
    'userId' | 'revenue' | 'datePaid' | 'orderType'
> & { orderId: string };

export type OrderDetails = ProductOrder & {
    customerName: string;
};

export type ProductOrder = Omit<
    Order,
    'cost' | 'productId' | 'userId' | 'value'
>;
export type CustomerOrder = Omit<
    Order,
    'purchaseLocation' | 'orderType' | 'cost' | 'userId' | 'value'
>;
export type CustomerOrderRequest = Omit<
    CustomerOrder,
    'datePaid' | 'productName' | 'profit'
>;
export type AdminOrder = Omit<Order, 'productName'>;
export type RestockOrder = Omit<
    Order,
    | 'datePaid'
    | 'orderType'
    | 'revenue'
    | 'profit'
    | 'productId'
    | 'userId'
    | 'value'
    | 'productName'
>;

export interface DateOrder {
    customerName: string;
    details: string;
    revenue: number;
}
