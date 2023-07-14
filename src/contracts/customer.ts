export interface Customer {
    customerId: string;
    customerName: string;
    balance: number;
    dueDate: string;
    totalOrders: number;
    totalRevenue: number;
}

export type CustomerPreview = Pick<
    Customer,
    'customerId' | 'customerName' | 'balance'
>;
