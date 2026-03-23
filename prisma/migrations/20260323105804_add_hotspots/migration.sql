-- This is an empty migration.-- 1. เปิดใช้งาน Extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. View สำหรับแสดงผลแบบ Point (จาก latitude, longitude)
CREATE OR REPLACE VIEW hotspots_points_spatial AS 
SELECT 
    id, 
    mission_id, 
    type,
    -- สร้าง Point พิกัด WGS84
    ST_SetSRID(ST_Point(longitude, latitude), 4326)::geometry(Point, 4326) as geom,
    confidence,
    created_at
FROM "hotspots"
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. View สำหรับแสดงผลแบบ Polygon (จาก JSON geometry)
CREATE OR REPLACE VIEW hotspots_polygons_spatial AS
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id, 
    id, 
    mission_id, 
    type,
    -- เปลี่ยนเป็น GeometryZ เพื่อรองรับพิกัดที่มีค่า 0 (ความสูง) ห้อยท้าย
    ST_SetSRID(ST_GeomFromGeoJSON(geometry::text), 4326)::geometry(GeometryZ, 4326) as geom,
    confidence,
    created_at
FROM "hotspots"
WHERE geometry IS NOT NULL;

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