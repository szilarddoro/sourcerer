alter table "public"."linting_results" alter column "comment" drop not null;
alter table "public"."linting_results" add column "comment" text;
