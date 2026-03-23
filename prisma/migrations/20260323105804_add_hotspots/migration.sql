-- 1. ลบ View เก่า (ห้ามลืม DROP ก่อนสร้างใหม่เสมอ)
DROP VIEW IF EXISTS hotspots_p30;
DROP VIEW IF EXISTS hotspots_p45;
DROP VIEW IF EXISTS hotspots_p60;
DROP VIEW IF EXISTS hotspots_polygons_spatial;
DROP VIEW IF EXISTS hotspots_points_spatial;

CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. View แสดงผลแบบ Point (จาก lat, lng)
CREATE OR REPLACE VIEW hotspots_points_spatial AS 
SELECT 
    id, mission_id, type,
    ST_SetSRID(ST_Point(longitude, latitude), 4326)::geometry(Point, 4326) as geom,
    confidence, created_at
FROM "hotspots"
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. View แสดงผลแบบ Polygon (ดึงค่าจาก JSON ตรงๆ)
CREATE VIEW hotspots_polygons_spatial AS
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id, 
    id, 
    mission_id, 
    type,
    -- เปลี่ยนจาก Geometry เป็น GeometryZ เพื่อรองรับพิกัด [lng, lat, 0]
    ST_SetSRID(ST_GeomFromGeoJSON(geometry::text), 4326)::geometry(GeometryZ, 4326) as geom,
    confidence,
    created_at
FROM "hotspots"
WHERE geometry IS NOT NULL;

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