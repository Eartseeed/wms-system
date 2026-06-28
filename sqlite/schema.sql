CREATE TABLE IF NOT EXISTS gate_logs (
  id TEXT PRIMARY KEY,
  plate_no TEXT,
  driver_name TEXT,
  gate_in DATETIME,
  gate_out DATETIME,
  weight_in REAL,
  weight_out REAL,
  status TEXT,
  sync_status TEXT
);

CREATE TABLE IF NOT EXISTS qc_logs (
  id TEXT PRIMARY KEY,
  gate_id TEXT,
  product_name TEXT,
  qty REAL,
  price REAL,
  image_path TEXT,
  document_path TEXT,
  created_at DATETIME,
  sync_status TEXT
);