SELECT * FROM Country;

-- Добавляем столбцы для хранения координат (имитация геометрии)
ALTER TABLE Country ADD (
    min_x NUMBER,  -- западная долгота
    min_y NUMBER,  -- южная широта
    max_x NUMBER,  -- восточная долгота
    max_y NUMBER,  -- северная широта
    wkt_geometry VARCHAR2(4000)  -- WKT представление
);


UPDATE Country SET 
    min_x = 26, min_y = 36, max_x = 45, max_y = 42,
    wkt_geometry = 'POLYGON((26 36, 45 36, 45 42, 26 42, 26 36))'
WHERE name = 'Турция';

UPDATE Country SET 
    min_x = 25, min_y = 22, max_x = 35, max_y = 32,
    wkt_geometry = 'POLYGON((25 22, 35 22, 35 32, 25 32, 25 22))'
WHERE name = 'Египет';

UPDATE Country SET 
    min_x = 6, min_y = 36, max_x = 19, max_y = 47,
    wkt_geometry = 'POLYGON((6 36, 19 36, 19 47, 6 47, 6 36))'
WHERE name = 'Италия';

UPDATE Country SET 
    min_x = 97, min_y = 5, max_x = 106, max_y = 21,
    wkt_geometry = 'POLYGON((97 5, 106 5, 106 21, 97 21, 97 5))'
WHERE name = 'Таиланд';

UPDATE Country SET 
    min_x = 19, min_y = 34, max_x = 29, max_y = 42,
    wkt_geometry = 'POLYGON((19 34, 29 34, 29 42, 19 42, 19 34))'
WHERE name = 'Греция';

UPDATE Country SET 
    min_x = 51, min_y = 22, max_x = 56, max_y = 27,
    wkt_geometry = 'POLYGON((51 22, 56 22, 56 27, 51 27, 51 22))'
WHERE name = 'ОАЭ';

COMMIT;