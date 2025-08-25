-- 创建 health_records 表
CREATE TABLE IF NOT EXISTS health_records (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  weight DECIMAL(5,2),
  exerciseType  TEXT,
  exerciseMinutes INTEGER DEFAULT 0,
  medicationType TEXT,
  medicationAmount DECIMAL(5,2),
  createdTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);