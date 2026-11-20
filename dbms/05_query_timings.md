# Query Timings

Queries from `04_queries.sql` run against the `relay_ap_2026` database (Postgres) seeded with ~20k users, ~30k api_keys, ~100k payments, ~150k webhook_events. Each query run 3 times; `EXPLAIN (ANALYZE, BUFFERS)` output for each is in `dbms/plans/`.

| Query | Description | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Average (ms) |
|---|---|---|---|---|---|
| Q1 | Top 10 spenders (SUM amount per user, successful payments) | 37.277 | 22.879 | 21.181 | 27.11 |
| Q2 | Payment count & failure rate by provider | 12.651 | 11.419 | 10.935 | 11.67 |
| Q3 | Users with more than one API key | 8.669 | 7.803 | 8.395 | 8.29 |
| Q4 | Webhook events for failed payments, last 30 days | 12.555 | 10.521 | 10.257 | 11.11 |
| Q5 | Monthly revenue trend (successful payments) | 8.613 | 8.081 | 8.294 | 8.33 |

Plans: `dbms/plans/q1_plan.txt` ... `dbms/plans/q5_plan.txt`
