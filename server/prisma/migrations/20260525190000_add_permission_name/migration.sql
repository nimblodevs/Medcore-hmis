-- Repair databases created from an older Permission shape before `name` was added.
ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "name" TEXT;

UPDATE "Permission"
SET "name" = COALESCE(NULLIF("description", ''), "code")
WHERE "name" IS NULL;

ALTER TABLE "Permission" ALTER COLUMN "name" SET NOT NULL;
