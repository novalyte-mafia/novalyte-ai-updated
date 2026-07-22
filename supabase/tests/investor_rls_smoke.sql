-- Investor portal RLS smoke checks (run with service role via execute_sql).
-- Expected: each probe returns the asserted row count / boolean.
-- These are documentation + manual verification helpers, not CI pgTAP yet.

-- 1) Confirm RLS is enabled on all investor tables
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname LIKE 'investor_%'
  AND c.relkind = 'r'
ORDER BY 1;

-- 2) Confirm every investor table has at least one policy
SELECT t.tablename, count(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename LIKE 'investor_%'
GROUP BY t.tablename
ORDER BY policy_count ASC, t.tablename;
