-- 1. ลบ View เก่า (ห้ามลืม DROP ก่อนสร้างใหม่เสมอ)
DROP VIEW IF EXISTS hotspots_p30;
DROP VIEW IF EXISTS hotspots_p45;
DROP VIEW IF EXISTS hotspots_p60;
DROP VIEW IF EXISTS hotspots_polygons_spatial;
DROP VIEW IF EXISTS hotspots_points_spatial;

CREATE EXTENSION IF NOT EXISTS postgis;

-- 4. ส่วนสำคัญ: View P30, P45, P60 (แก้ให้ใช้ Point แทน Geometry)
-- ใช้ ST_PointOnSurface เพื่อให้รองรับข้อมูลที่เป็นได้ทั้ง Point และ Polygon จากโดรน
CREATE OR REPLACE VIEW hotspots_p30 AS 
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id,
    id, mission_id, confidence, created_at,
    ST_SetSRID(ST_Force2D(ST_PointOnSurface(ST_GeomFromGeoJSON(geometry::text))), 4326)::geometry(Point, 4326) as geom
FROM hotspots WHERE type = 'PRED_30';

CREATE OR REPLACE VIEW hotspots_p45 AS 
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id,
    id, mission_id, confidence, created_at,
    ST_SetSRID(ST_Force2D(ST_PointOnSurface(ST_GeomFromGeoJSON(geometry::text))), 4326)::geometry(Point, 4326) as geom
FROM hotspots WHERE type = 'PRED_45';

CREATE OR REPLACE VIEW hotspots_p60 AS 
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id,
    id, mission_id, confidence, created_at,
    ST_SetSRID(ST_Force2D(ST_PointOnSurface(ST_GeomFromGeoJSON(geometry::text))), 4326)::geometry(Point, 4326) as geom
FROM hotspots WHERE type = 'PRED_60';