DROP VIEW IF EXISTS hotspots_p30;
DROP VIEW IF EXISTS hotspots_p45;
DROP VIEW IF EXISTS hotspots_p60;
DROP VIEW IF EXISTS hotspots_polygons_spatial;
DROP VIEW IF EXISTS hotspots_points_spatial;
-- This is an empty migration.-- 1. เปิดใช้งาน Extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- This is an empty migration.

-- 1. View สำหรับ 30 นาที
CREATE OR REPLACE VIEW hotspots_p30 AS 
SELECT id, mission_id, confidence, created_at,
       ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Geometry, 4326) as geom
FROM hotspots WHERE type = 'PRED_30';

-- 2. View สำหรับ 45 นาที
CREATE OR REPLACE VIEW hotspots_p45 AS 
SELECT id, mission_id, confidence, created_at,
       ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Geometry, 4326) as geom
FROM hotspots WHERE type = 'PRED_45';

-- 3. View สำหรับ 60 นาที
CREATE OR REPLACE VIEW hotspots_p60 AS 
SELECT id, mission_id, confidence, created_at,
       ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Geometry, 4326) as geom
FROM hotspots WHERE type = 'PRED_60';