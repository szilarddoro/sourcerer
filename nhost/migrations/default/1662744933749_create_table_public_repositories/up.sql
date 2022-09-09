CREATE TABLE "public"."repositories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "owner" text NOT NULL, "name" text NOT NULL, "avatar" text, PRIMARY KEY ("owner","name") , UNIQUE ("id"), UNIQUE ("owner", "name"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
