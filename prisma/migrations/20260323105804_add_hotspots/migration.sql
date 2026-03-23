-- 1. ลบ View เก่าทิ้งให้หมดก่อน (เพื่อเปลี่ยน Data Type)
DROP VIEW IF EXISTS hotspots_p30;
DROP VIEW IF EXISTS hotspots_p45;
DROP VIEW IF EXISTS hotspots_p60;
DROP VIEW IF EXISTS hotspots_polygons_spatial;
DROP VIEW IF EXISTS hotspots_points_spatial;

-- 2. เปิดใช้งาน Extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 3. View สำหรับ Point Spatial (จาก lat/lng)
CREATE VIEW hotspots_points_spatial AS 
SELECT 
    id, 
    mission_id, 
    type,
    ST_SetSRID(ST_Point(longitude, latitude), 4326)::geometry(Point, 4326) as geom,
    confidence,
    created_at
FROM "hotspots"
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 4. View สำหรับ Polygon (ระบุเป็น MultiPolygonZ เพื่อความปลอดภัย)
CREATE VIEW hotspots_polygons_spatial AS
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id, 
    id, 
    mission_id, 
    type,
    ST_SetSRID(ST_GeomFromGeoJSON(geometry::text), 4326)::geometry(MultiPolygonZ, 4326) as geom,
    confidence,
    created_at
FROM "hotspots"
-- กรองเอาเฉพาะข้อมูลที่เป็น Polygon หรือ MultiPolygon เท่านั้น
WHERE geometry IS NOT NULL AND (geometry->>'type' ILIKE '%Polygon%');

-- 5. View สำหรับ 30 นาที (เพิ่ม qgis_id และกรองเฉพาะ Point)
CREATE VIEW hotspots_p30 AS 
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id,
    id, mission_id, confidence, created_at,
    ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Point, 4326) as geom
FROM hotspots 
WHERE type = 'PRED_30' AND (geometry->>'type' = 'Point');

-- 6. View สำหรับ 45 นาที
CREATE VIEW hotspots_p45 AS 
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id,
    id, mission_id, confidence, created_at,
    ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Point, 4326) as geom
FROM hotspots 
WHERE type = 'PRED_45' AND (geometry->>'type' = 'Point');

-- 7. View สำหรับ 60 นาที
CREATE VIEW hotspots_p60 AS 
SELECT 
    (ROW_NUMBER() OVER ())::int as qgis_id,
    id, mission_id, confidence, created_at,
    ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON(geometry::text)), 4326)::geometry(Point, 4326) as geom
FROM hotspots 
WHERE type = 'PRED_60' AND (geometry->>'type' = 'Point');