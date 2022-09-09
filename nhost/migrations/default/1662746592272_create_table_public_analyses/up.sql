CREATE TABLE "public"."analyses" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "base_path" text, "repository_id" uuid, "git_branch" text, "git_commit_hash" text, "error_count" integer, "fatal_error_count" integer, "fixable_error_count" integer, "fixable_warning_count" integer, "warning_count" integer, PRIMARY KEY ("id") , FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON UPDATE restrict ON DELETE cascade);
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_analyses_updated_at"
BEFORE UPDATE ON "public"."analyses"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_analyses_updated_at" ON "public"."analyses" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
