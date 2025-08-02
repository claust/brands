-- Create categories enum
CREATE TYPE brand_category AS ENUM (
  'Food & Beverages',
  'Personal Care',
  'Household Products',
  'Clothing & Fashion',
  'Electronics & Technology',
  'Automotive',
  'Pharmaceuticals/Health',
  'Entertainment/Media',
  'Retail',
  'Financial Services',
  'Pet Care'
);

-- Create companies table
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  headquarters TEXT,
  founded INTEGER CHECK (founded IS NULL OR (founded >= 1000 AND founded <= EXTRACT(YEAR FROM CURRENT_DATE))),
  employees INTEGER CHECK (employees IS NULL OR employees >= 0),
  revenue TEXT,
  info_search_date TIMESTAMP WITH TIME ZONE,
  info_search_status TEXT CHECK (info_search_status IN ('success', 'failed', 'skipped')),
  info_search_error TEXT,
  info_sources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create brands table
CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category brand_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_parent_id ON companies(parent_id);
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_owner_id ON brands(owner_id);
CREATE INDEX idx_brands_category ON brands(category);

-- Create full text search indexes
CREATE INDEX idx_companies_search ON companies USING gin(to_tsvector('english', name));
CREATE INDEX idx_brands_search ON brands USING gin(to_tsvector('english', name));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW companies_with_counts AS
SELECT 
  c.*,
  COUNT(DISTINCT b.id) as brand_count,
  COUNT(DISTINCT s.id) as subsidiary_count
FROM companies c
LEFT JOIN brands b ON b.owner_id = c.id
LEFT JOIN companies s ON s.parent_id = c.id
GROUP BY c.id;

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "Public read access" ON companies
  FOR SELECT
  USING (true);

CREATE POLICY "Public read access" ON brands
  FOR SELECT
  USING (true);

-- Create admin write policies (requires authenticated user with admin role)
CREATE POLICY "Admin write access" ON companies
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin write access" ON brands
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');