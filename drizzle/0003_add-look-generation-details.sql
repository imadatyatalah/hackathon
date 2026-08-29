ALTER TABLE "looks" ADD COLUMN "image_data_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "category" text NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "body_chest_cm" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "body_height_cm" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "body_shoulder_cm" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "reference_size" text NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "recommended_size" text NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "recommended_chest_cm" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "looks" ADD COLUMN "size_chart" jsonb NOT NULL;