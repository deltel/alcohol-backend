export interface Order {
    dateOrdered: string;
    purchaseLocation: string;
    datePaid: string | null;
    orderType: string;
    productName: string;
    quantity: number;
    cost: number;
    revenue: number;
    profit: number;
}
