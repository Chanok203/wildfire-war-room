CREATE EXTENSION IF NOT EXISTS postgis;

CREATE OR REPLACE VIEW hotspots_spatial AS 
SELECT 
    id, 
    mission_id, 
    ST_SetSRID(ST_Point(longitude, latitude), 4326)::geometry(Point, 4326) as geom,
    confidence,
    created_at
FROM "hotspots";