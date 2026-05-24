USE TravelAgency;
GO

---- Добавляем столбец для геометрии (границ стран)
--ALTER TABLE Country ADD geom GEOMETRY;
--GO

---- Создаем пространственный индекс
--CREATE SPATIAL INDEX IX_Country_geom ON Country(geom)
--WITH (BOUNDING_BOX = (-180, -90, 180, 90));
--GO

-- 2. Заполняем геометрию для ваших стран
-- Турция
UPDATE Country SET geom = geometry::STPolyFromText('POLYGON((26 36, 45 36, 45 42, 26 42, 26 36))', 4326)
WHERE name = 'Турция';

-- Египет
UPDATE Country SET geom = geometry::STPolyFromText('POLYGON((25 22, 35 22, 35 32, 25 32, 25 22))', 4326)
WHERE name = 'Египет';

-- Италия
UPDATE Country SET geom = geometry::STPolyFromText('POLYGON((6 36, 19 36, 19 47, 6 47, 6 36))', 4326)
WHERE name = 'Италия';

-- Таиланд
UPDATE Country SET geom = geometry::STPolyFromText('POLYGON((97 5, 106 5, 106 21, 97 21, 97 5))', 4326)
WHERE name = 'Таиланд';

-- Греция
UPDATE Country SET geom = geometry::STPolyFromText('POLYGON((19 34, 29 34, 29 42, 19 42, 19 34))', 4326)
WHERE name = 'Греция';

-- ОАЭ
UPDATE Country SET geom = geometry::STPolyFromText('POLYGON((51 22, 56 22, 56 27, 51 27, 51 22))', 4326)
WHERE name = 'ОАЭ';
GO

-- 3. Проверяем, что геометрия добавилась
SELECT name, geom.STAsText() AS WKT_Geometry
FROM Country
WHERE geom IS NOT NULL;


-- 6. Тип пространственных данных
SELECT DISTINCT geom.STGeometryType() AS GeometryType
FROM Country
WHERE geom IS NOT NULL;

-- 7. SRID
SELECT DISTINCT geom.STSrid AS SRID
FROM Country
WHERE geom IS NOT NULL;

-- 8. Атрибутивные столбцы
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Country';

-- 9. WKT описание 
SELECT name, geom.STAsText() AS WKT_Description
FROM Country
WHERE geom IS NOT NULL;



---- 10.1 Нахождение пересечения пространственных объектов
SELECT A.name AS Country1, B.name AS Country2
FROM Country A, Country B
WHERE A.id < B.id
  AND A.geom.STIntersects(B.geom) = 1
  AND A.geom IS NOT NULL 
  AND B.geom IS NOT NULL;


---- 10.2 Нахождение координат вершин
SELECT name, geom.STAsText() AS Vertices
FROM Country
WHERE name = 'Италия';



---- 10.3 Нахождение площади
SELECT name, geom.STArea() AS Area_SqDegrees
FROM Country
WHERE geom IS NOT NULL
ORDER BY Area_SqDegrees DESC;




---- 11-12
---- Точка (Анкара, Турция)
DECLARE @point GEOMETRY = GEOMETRY::STPointFromText('POINT(33 39)', 4326);
SELECT name FROM Country WHERE geom.STIntersects(@point) = 1;


---- Линия (через несколько стран)
DECLARE @line GEOMETRY = GEOMETRY::STLineFromText('LINESTRING(10 30, 30 35, 50 40)', 4326);
SELECT name FROM Country WHERE geom.STIntersects(@line) = 1;


---- Полигон 
DECLARE @polygon GEOMETRY = GEOMETRY::STPolyFromText('POLYGON((0 30, 30 30, 30 50, 0 50, 0 30))', 4326);
SELECT name FROM Country WHERE geom.STIntersects(@polygon) = 1;


---- 13. Пространственный индекс
CREATE SPATIAL INDEX IX_Country_geom
ON Country(geom)
USING GEOMETRY_GRID
WITH (BOUNDING_BOX = (-180, -90, 180, 90));

DROP INDEX IX_Country_geom ON Country;



---- 14. Хранимая процедура
GO
CREATE PROCEDURE sp_FindCountryByPoint
    @Longitude FLOAT,
    @Latitude FLOAT
AS
BEGIN
    DECLARE @point GEOMETRY = GEOMETRY::STPointFromText('POINT(' + CAST(@Longitude AS VARCHAR) + ' ' + CAST(@Latitude AS VARCHAR) + ')', 4326);
    
    SELECT name, geom.STAsText() AS GeometryWKT
    FROM Country
    WHERE geom.STIntersects(@point) = 1;
END;
GO



EXEC sp_FindCountryByPoint 33, 39;  -- Турция
EXEC sp_FindCountryByPoint 12, 41;  -- Италия
EXEC sp_FindCountryByPoint 29, 38;  -- Греция
EXEC sp_FindCountryByPoint 100, 10; -- Таиланд


