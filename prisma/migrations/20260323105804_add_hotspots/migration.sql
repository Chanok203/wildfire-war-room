DROP VIEW IF EXISTS hotspots_p30;
DROP VIEW IF EXISTS hotspots_p45;
DROP VIEW IF EXISTS hotspots_p60;
DROP VIEW IF EXISTS hotspots_polygons_spatial;
DROP VIEW IF EXISTS hotspots_points_spatial;

-- 1. เปิดใช้งาน Extension PostGIS (ถ้ามีแล้วข้ามได้)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. View สำหรับแสดงผลแบบ Point (จาก latitude, longitude)
-- ระบุชัดเจนว่าเป็น geometry(Point, 4326)
CREATE OR REPLACE VIEW hotspots_points_spatial AS 
SELECT 
    id, 
    mission_id, 
    type,
    ST_SetSRID(ST_Point(longitude, latitude), 4326)::geometry(Point, 4326) as geom,
    confidence,
    created_at
FROM "hotspots"
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. View สำหรับแสดงผลแบบ Polygon (จาก JSON geometry)
-- ใช้ MultiPolygon เพื่อรองรับข้อมูลที่ซับซ้อน และระบุ GeometryZ ให้ตรงกับข้อมูลโดรน
CREATE OR REPLACE VIEW hotspots_polygons_spatial AS
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id, 
    id, 
    mission_id, 
    type,
    ST_SetSRID(ST_GeomFromGeoJSON(geometry::text), 4326)::geometry(MultiPolygonZ, 4326) as geom,
    confidence,
    created_at
FROM "hotspots"
WHERE geometry IS NOT NULL AND geometry::text LIKE '%Polygon%';

-- 4. View สำหรับ 30 นาที (ระบุเป็น Point ให้ Server รู้ Metadata ทันที)
CREATE OR REPLACE VIEW hotspots_p30 AS 
SELECT id, mission_id, confidence, created_at,
       ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Point, 4326) as geom
FROM hotspots WHERE type = 'PRED_30';

-- 5. View สำหรับ 45 นาที
CREATE OR REPLACE VIEW hotspots_p45 AS 
SELECT id, mission_id, confidence, created_at,
       ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Point, 4326) as geom
FROM hotspots WHERE type = 'PRED_45';

-- 6. View สำหรับ 60 นาที
CREATE OR REPLACE VIEW hotspots_p60 AS 
SELECT id, mission_id, confidence, created_at,
       ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Point, 4326) as geom
FROM hotspots WHERE type = 'PRED_60';