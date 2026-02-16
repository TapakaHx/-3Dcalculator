-- Create unique indexes for name fields used by seed upserts
CREATE UNIQUE INDEX IF NOT EXISTS "Printer_name_key" ON "Printer"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Material_name_key" ON "Material"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Service_name_key" ON "Service"("name");
