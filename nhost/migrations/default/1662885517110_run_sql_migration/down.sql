-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE FUNCTION count_in_result (linting_result linting_results)
-- RETURNS bigint AS $$
--     SELECT count(rule_id)
--     FROM linting_results
--     WHERE analysis_id=linting_result.analysis_id AND rule_id=linting_result.rule_id
--     GROUP BY rule_id
-- $$ LANGUAGE sql STABLE;
