-- 创建 health_records 表
-- CREATE TABLE IF NOT EXISTS health_records (
--   id SERIAL PRIMARY KEY,
--   date DATE NOT NULL UNIQUE,
--   weight DECIMAL(5,2),
--   exerciseType  TEXT,
--   exerciseMinutes INTEGER DEFAULT 0,
--   medicationType TEXT,
--   medicationAmount DECIMAL(5,2),
--   createdTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updatedTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 插入既有数据
INSERT INTO health_records (
    date,
    weight,
    exerciseType,
    exerciseMinutes,
    medicationType,
    medicationAmount
  )
VALUES ('2025-08-04', 113, '爬坡', 30, NULL, NULL),
  ('2025-08-05', 113, '爬坡', 42, NULL, NULL),
  ('2025-08-06', 111.8, '爬坡', 42, NULL, NULL),
  ('2025-08-07', 112.1, '爬坡', 43, NULL, NULL),
  ('2025-08-08', 112.1, '爬坡', 45, NULL, NULL),
  ('2025-08-09', 112.1, '爬坡', 45, '替尔泊肽', 2.5),
  ('2025-08-10', 111.4, '爬坡', 48, NULL, NULL),
  ('2025-08-11', 110.8, '爬坡', 45, NULL, NULL),
  ('2025-08-12', 110, '爬坡', 45, NULL, NULL),
  ('2025-08-13', 109.1, '爬坡', 46, NULL, NULL),
  ('2025-08-14', 109.1, '爬坡', 45, NULL, NULL),
  ('2025-08-15', 108.5, '爬坡', 45, NULL, NULL),
  ('2025-08-16', 107.9, '爬坡', 45, '替尔泊肽', 2.5),
  ('2025-08-17', 107.2, '爬坡', 45, NULL, NULL),
  ('2025-08-18', 106.9, '爬坡', 45, NULL, NULL),
  ('2025-08-19', 106.7, '爬坡', 45, NULL, NULL),
  ('2025-08-20', 106.7, '爬坡', 45, NULL, NULL),
  ('2025-08-21', 106.4, '爬坡', 45, NULL, NULL);