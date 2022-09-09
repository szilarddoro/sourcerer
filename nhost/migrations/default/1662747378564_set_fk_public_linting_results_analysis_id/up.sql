alter table "public"."linting_results"
  add constraint "linting_results_analysis_id_fkey"
  foreign key ("analysis_id")
  references "public"."analyses"
  ("id") on update restrict on delete cascade;
