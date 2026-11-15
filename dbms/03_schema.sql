CREATE TABLE users (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash text NOT NULL UNIQUE,
    name text,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id),
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    currency varchar(3) NOT NULL DEFAULT 'INR',
    provider text NOT NULL CHECK (provider IN ('stripe', 'razorpay', 'paypal')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE webhook_events (
    id serial PRIMARY KEY,
    payment_id integer NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    payload text,
    received_at timestamp NOT NULL DEFAULT now()
);
