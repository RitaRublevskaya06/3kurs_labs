USE TravelAgency;
GO

-- задание 1
CREATE OR ALTER FUNCTION GET_TOURS_BY_DATE_RANGE (
    @StartDate DATE,
    @EndDate DATE
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        t.id AS TourID,
        t.title AS TourName,
        c.name AS Country,
        h.name AS Hotel,
        h.stars AS HotelStars,
        t.duration_days AS Duration,
        t.departure_date AS DepartureDate,
        t.base_price AS Price,
        t.available_seats AS AvailableSeats,
        tt.name AS TourType
    FROM Tour t
    INNER JOIN Country c ON t.country_id = c.id
    INNER JOIN Hotel h ON t.hotel_id = h.id
    LEFT JOIN TourType tt ON t.tour_type_id = tt.id
    WHERE t.departure_date BETWEEN @StartDate AND @EndDate
        AND t.is_active = 1
);
GO


-- проверка
SELECT * FROM GET_TOURS_BY_DATE_RANGE('2024-06-01', '2024-12-31');
GO

-- задание 2 (cmd)
---- bcp "SELECT * FROM TravelAgency.dbo.GET_TOURS_BY_DATE_RANGE('2024-06-01', '2024-12-31')" queryout "D:\Univer\3_kurs\6sem\PRBDIP\Lab_11\tours_export.txt" -w -t, -S localhost -T


-- задание 3
---- файл импорт

-- задание 4

SELECT id, name FROM Country;
SELECT id, name FROM Hotel;
SELECT id, name FROM TourType;

DROP TABLE IF EXISTS #TempImport;
GO

CREATE TABLE #TempImport (
    Title NVARCHAR(255),
    CountryID INT,
    HotelID INT,
    TourTypeID INT,
    Duration INT,
    DepartureDate DATE,
    BasePrice DECIMAL(10,2),
    AvailableSeats INT
);
GO

BULK INSERT #TempImport
FROM 'D:\Univer\3_kurs\6sem\PRBDIP\Lab_11\tours_import.txt'
WITH (
    FIRSTROW = 2,
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '\n',
    CODEPAGE = '65001'
);
GO

SELECT * FROM #TempImport;
GO

INSERT INTO Tour (
    title,
    description,
    tour_type_id,
    country_id,
    hotel_id,
    duration_days,
    departure_date,
    base_price,
    available_seats,
    is_active,
    created_at
)
SELECT 
    t.Title,
    N'Импортированный тур' AS description,
    t.TourTypeID,
    t.CountryID,
    t.HotelID,
    t.Duration,
    t.DepartureDate,
    t.BasePrice,
    t.AvailableSeats,
    1 AS is_active,
    GETDATE() AS created_at
FROM #TempImport t
WHERE NOT EXISTS (
    SELECT 1 FROM Tour 
    WHERE title = t.Title 
        AND departure_date = t.DepartureDate
);

PRINT N'Импортировано строк: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));
GO

-- проверка
SELECT id, title, departure_date, base_price 
FROM Tour 
WHERE created_at >= DATEADD(day, -1, GETDATE())
ORDER BY id DESC;
GO

-- очистка
DROP TABLE #TempImport;
GO


--проверка
SELECT TOP 10 * FROM Tour ORDER BY id DESC;
GO

-- очистка
SELECT id, title, departure_date, description
FROM Tour 
WHERE description = 'Импортированный тур'
ORDER BY id;


DELETE FROM Tour 
WHERE description = 'Импортированный тур';
