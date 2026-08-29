CREATE TABLE "looks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_photo_url" text NOT NULL,
	"garment_photo_url" text NOT NULL,
	"replicate_prediction_id" text NOT NULL,
	"fit_verdict" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "looks" ADD CONSTRAINT "looks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "looks_userId_idx" ON "looks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "looks_replicatePredictionId_uidx" ON "looks" USING btree ("replicate_prediction_id");