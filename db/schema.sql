-- Skema database Bhumi. Dijalankan oleh `npm run db:setup` (scripts/seed.mjs).
-- Semua tabel dibuat ulang dari nol; jangan jalankan di database produksi.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS
  weekly_challenges, reminders, care_logs, progress_photos, journal_entries,
  plant_checklist_progress, plant_tasks, plants, orders, user_badges, badges,
  stage_daily_tasks, stage_checklist, stage_sections, pack_stages, pack_gallery,
  pack_kit_items, pack_highlights, packs, sessions, users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------- Akun ----------

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          ENUM('superadmin','customer') NOT NULL DEFAULT 'customer',
  shields       TINYINT NOT NULL DEFAULT 1,
  best_streak   INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sessions (
  token      CHAR(64) PRIMARY KEY,
  user_id    INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Katalog paket ----------

CREATE TABLE packs (
  id         VARCHAR(60) PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  tagline    VARCHAR(255) NOT NULL DEFAULT '',
  level      ENUM('Pemula','Menengah','Mahir') NOT NULL DEFAULT 'Pemula',
  days       INT NOT NULL DEFAULT 60,
  price      INT NOT NULL DEFAULT 0,
  is_new     TINYINT(1) NOT NULL DEFAULT 0,
  status     ENUM('Terbit','Draf') NOT NULL DEFAULT 'Draf',
  sold       INT NOT NULL DEFAULT 0,
  photo_url  VARCHAR(500) NOT NULL DEFAULT '',
  effort     VARCHAR(40) NOT NULL DEFAULT '10 mnt/hari',
  sun        VARCHAR(40) NOT NULL DEFAULT '5–6 jam',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chip singkat "isi paket" di kartu katalog.
CREATE TABLE pack_highlights (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  pack_id    VARCHAR(60) NOT NULL,
  label      VARCHAR(80) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rincian isi paket di halaman detail.
CREATE TABLE pack_kit_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pack_id     VARCHAR(60) NOT NULL,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  qty         VARCHAR(40) NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pack_gallery (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  pack_id    VARCHAR(60) NOT NULL,
  label      VARCHAR(120) NOT NULL,
  photo_url  VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tahap panduan. Rentang hari dihitung dari durasi kumulatif.
CREATE TABLE pack_stages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  pack_id       VARCHAR(60) NOT NULL,
  stage_no      INT NOT NULL,
  title         VARCHAR(120) NOT NULL,
  short_label   VARCHAR(30) NOT NULL DEFAULT '',
  duration_days INT NOT NULL DEFAULT 7,
  description   TEXT,
  intro         TEXT,
  instruction   TEXT,
  media         VARCHAR(200) NOT NULL DEFAULT '',
  photo_url     VARCHAR(500) NOT NULL DEFAULT '',
  badge_id      VARCHAR(30) NULL,
  UNIQUE KEY uq_pack_stage (pack_id, stage_no),
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stage_sections (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  stage_id   INT NOT NULL,
  heading    VARCHAR(160) NOT NULL,
  body       TEXT NOT NULL,
  img_label  VARCHAR(160) NOT NULL DEFAULT '',
  photo_url  VARCHAR(500) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (stage_id) REFERENCES pack_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stage_checklist (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  stage_id   INT NOT NULL,
  label      VARCHAR(160) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (stage_id) REFERENCES pack_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rutinitas harian per tahap; dibuat jadi plant_tasks tiap hari.
CREATE TABLE stage_daily_tasks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  stage_id   INT NOT NULL,
  title      VARCHAR(120) NOT NULL,
  when_label ENUM('Pagi','Sore') NOT NULL DEFAULT 'Pagi',
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (stage_id) REFERENCES pack_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Gamifikasi ----------

CREATE TABLE badges (
  id         VARCHAR(30) PRIMARY KEY,
  name       VARCHAR(80) NOT NULL,
  icon       VARCHAR(30) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_badges (
  user_id   INT NOT NULL,
  badge_id  VARCHAR(30) NOT NULL,
  earned_at DATETIME NOT NULL,
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Satu baris per hari perawatan. 'shield' = hari terlewat yang ditutup pelindung.
CREATE TABLE care_logs (
  user_id  INT NOT NULL,
  log_date DATE NOT NULL,
  kind     ENUM('done','shield') NOT NULL DEFAULT 'done',
  PRIMARY KEY (user_id, log_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Pesanan & tanaman ----------

CREATE TABLE orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  pack_id    VARCHAR(60) NOT NULL,
  qty        INT NOT NULL DEFAULT 1,
  total      INT NOT NULL DEFAULT 0,
  status     ENUM('dipesan','dikirim','diterima') NOT NULL DEFAULT 'dipesan',
  ordered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pack_id) REFERENCES packs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE plants (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  pack_id         VARCHAR(60) NOT NULL,
  name            VARCHAR(80) NOT NULL,
  photo_url       VARCHAR(500) NOT NULL DEFAULT '',
  planted_on      DATE NOT NULL,
  health          ENUM('sehat','perhatian','kritis') NOT NULL DEFAULT 'sehat',
  last_seen_stage INT NOT NULL DEFAULT 1,
  harvested_on    DATE NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pack_id) REFERENCES packs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE plant_tasks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  plant_id   INT NOT NULL,
  task_date  DATE NOT NULL,
  title      VARCHAR(120) NOT NULL,
  when_label ENUM('Pagi','Sore') NOT NULL DEFAULT 'Pagi',
  sort_order INT NOT NULL DEFAULT 0,
  done_at    DATETIME NULL,
  KEY idx_plant_date (plant_id, task_date),
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE plant_checklist_progress (
  plant_id     INT NOT NULL,
  checklist_id INT NOT NULL,
  done_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plant_id, checklist_id),
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_id) REFERENCES stage_checklist(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE journal_entries (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  plant_id   INT NOT NULL,
  entry_date DATE NOT NULL,
  text       TEXT NOT NULL,
  photo_url  VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE progress_photos (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  plant_id  INT NOT NULL,
  taken_on  DATE NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reminders (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  remind_on DATE NOT NULL,
  text      VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE weekly_challenges (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  week_start DATE NOT NULL,
  text       VARCHAR(255) NOT NULL,
  target     INT NOT NULL DEFAULT 2,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
