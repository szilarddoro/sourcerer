CREATE TABLE "public"."linting_results" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "rule_id" text NOT NULL, "severity" int2 NOT NULL, "line" integer NOT NULL, "end_line" integer NOT NULL, "column" integer NOT NULL, "end_column" integer NOT NULL, "file_path" text NOT NULL, "message" text, "analysis_id" uuid NOT NULL, PRIMARY KEY ("id") );
CREATE EXTENSION IF NOT EXISTS pgcrypto;
