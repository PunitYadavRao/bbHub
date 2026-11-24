-- Colleges and the email domains that prove membership (subdomains included).
INSERT INTO "colleges" ("id", "name", "city", "allowed_domains", "timezone")
VALUES ('rishihood-sonipat', 'Rishihood University', 'Sonipat', ARRAY['rishihood.edu.in'], 'Asia/Kolkata')
ON CONFLICT ("id") DO NOTHING;
