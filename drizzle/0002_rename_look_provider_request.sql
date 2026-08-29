-- Custom SQL migration file, put your code below! --
ALTER TABLE "looks" RENAME COLUMN "replicate_prediction_id" TO "provider_request_id";--> statement-breakpoint
ALTER INDEX "looks_replicatePredictionId_uidx" RENAME TO "looks_providerRequestId_uidx";
