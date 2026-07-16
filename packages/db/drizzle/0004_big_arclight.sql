CREATE TABLE "recipe" (
	"id" uuid PRIMARY KEY NOT NULL,
	"household_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredient" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric NOT NULL,
	"unit" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_step" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipe_id" uuid NOT NULL,
	"text" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_recipe_id_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_step" ADD CONSTRAINT "recipe_step_recipe_id_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;