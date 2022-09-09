alter table "public"."repositories" add constraint "repositories_owner_name_key" unique ("owner", "name");
