-- Q1: Total successful payment amount per user, top 10 spenders
SELECT u.id, u.name, SUM(p.amount) AS total_spent
FROM users u
JOIN payments p ON p.user_id = u.id
WHERE p.status = 'success'
GROUP BY u.id, u.name
ORDER BY total_spent DESC
LIMIT 10;

-- Q2: Payment count and failure rate by provider
SELECT provider,
       COUNT(*) AS total_payments,
       COUNT(*) FILTER (WHERE status = 'failed') AS failed_payments,
       ROUND(COUNT(*) FILTER (WHERE status = 'failed')::numeric / COUNT(*) * 100, 2) AS failure_pct
FROM payments
GROUP BY provider;

-- Q3: Users with more than one API key, along with key count
SELECT u.id, u.name, COUNT(ak.id) AS key_count
FROM users u
JOIN api_keys ak ON ak.user_id = u.id
GROUP BY u.id, u.name
HAVING COUNT(ak.id) > 1
ORDER BY key_count DESC
LIMIT 20;

-- Q4: Webhook events for failed payments in the last 30 days
SELECT we.id, we.event_type, we.received_at, p.id AS payment_id, p.amount
FROM webhook_events we
JOIN payments p ON p.id = we.payment_id
WHERE p.status = 'failed'
  AND we.received_at >= now() - interval '30 days'
ORDER BY we.received_at DESC
LIMIT 50;

-- Q5: Monthly revenue trend from successful payments
SELECT date_trunc('month', created_at) AS month,
       SUM(amount) AS revenue,
       COUNT(*) AS num_payments
FROM payments
WHERE status = 'success'
GROUP BY month
ORDER BY month;
