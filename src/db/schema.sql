CREATE TABLE users (
	user_id SMALLINT NOT NULL AUTO_INCREMENT,
    role VARCHAR(8) NOT NULL DEFAULT 'customer',
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    telephone CHAR(10) NOT NULL UNIQUE,
    balance_due_date DATE,
    balance DECIMAL(7, 2) NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id),
    CHECK(balance >= 0)
);

CREATE TABLE products (
	product_id SMALLINT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    volume VARCHAR(10) NOT NULL,
    stock_level TINYINT NOT NULL,
    unit_cost DECIMAL(7,2) NOT NULL,
    selling_price DECIMAL(7,2) NOT NULL,
    wholesale_price DECIMAL(7,2) NOT NULL,
    total_value DECIMAL(8,2) NOT NULL,
    total_orders SMALLINT NOT NULL,
    total_cost DECIMAL(9,2) NOT NULL,
    total_revenue DECIMAL(9,2) NOT NULL,
    total_profit DECIMAL(9,2) NOT NULL,
    PRIMARY KEY(product_id),
    CHECK(stock_level >= 0),
    CHECK(total_value >= 0),
    CHECK(total_orders >= 0),
    CHECK(total_cost >= 0),
    CHECK(total_revenue >= 0),
    CHECK(total_profit >= 0)
);

CREATE TABLE orders (
	order_id SMALLINT NOT NULL AUTO_INCREMENT,
    product_id SMALLINT NOT NULL,
    user_id SMALLINT NOT NULL,
    date_ordered DATE NOT NULL,
    purchase_location VARCHAR(50) NOT NULL,
    date_paid DATE,
    order_type CHAR(8) NOT NULL,
    quantity TINYINT NOT NULL,
    cost DECIMAL(9,2),
    revenue DECIMAL(9,2) NOT NULL,
    profit DECIMAL(9,2),
    PRIMARY KEY(order_id),
    FOREIGN KEY (product_id)
		REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
	FOREIGN KEY (user_id)
		REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
	CHECK(quantity >= 0),
    CHECK(cost >= 0),
    CHECK(revenue >= 0),
    CHECK(profit >= 0)
);