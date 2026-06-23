CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"execution_date" text,
	"gallery" text DEFAULT '[]' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutorials" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"youtube_url" text NOT NULL,
	"thumbnail_url" text,
	"order" integer DEFAULT 0 NOT NULL
);
