USE TravelAgency;
GO


-- 3. Вычисление итогов предоставленных услуг помесячно, за квартал, за полгода, за год
SELECT DISTINCT
    YEAR(b.booking_date) AS Год,
    MONTH(b.booking_date) AS Месяц,
    DATENAME(MONTH, b.booking_date) AS 'Название месяца',
    SUM(b.total_price) OVER (PARTITION BY YEAR(b.booking_date), MONTH(b.booking_date)) AS 'Итог за месяц',
    SUM(b.total_price) OVER (PARTITION BY YEAR(b.booking_date), 
        CASE 
            WHEN MONTH(b.booking_date) BETWEEN 1 AND 3 THEN 1
            WHEN MONTH(b.booking_date) BETWEEN 4 AND 6 THEN 2
            WHEN MONTH(b.booking_date) BETWEEN 7 AND 9 THEN 3
            ELSE 4
        END) AS 'Итог за квартал',
    SUM(b.total_price) OVER (PARTITION BY YEAR(b.booking_date),
        CASE WHEN MONTH(b.booking_date) <= 6 THEN 1 ELSE 2 END) AS 'Итог за полгода',
    SUM(b.total_price) OVER (PARTITION BY YEAR(b.booking_date)) AS 'Итог за год',
    COUNT(b.id) OVER (PARTITION BY YEAR(b.booking_date), MONTH(b.booking_date)) AS 'Количество бронирований'
FROM Booking b
INNER JOIN OrderStatus os ON b.status_id = os.id
WHERE os.name IN ('completed', 'paid')
    AND b.booking_date >= '2023-01-01'
ORDER BY Год, Месяц;
GO


-- 4. Вычисление итогов за период с процентами
DECLARE @StartDate DATE = '2024-01-01';
DECLARE @EndDate DATE = '2024-12-31';

WITH MonthlySales AS (
    SELECT 
        FORMAT(b.booking_date, 'yyyy-MM') AS Period,
        SUM(b.total_price) AS ServiceVolume,
        COUNT(b.id) AS ServiceCount
    FROM Booking b
    INNER JOIN OrderStatus os ON b.status_id = os.id
    WHERE os.name IN ('completed', 'paid')
        AND b.booking_date BETWEEN @StartDate AND @EndDate
    GROUP BY FORMAT(b.booking_date, 'yyyy-MM')
),
TotalStats AS (
    SELECT 
        SUM(ServiceVolume) AS TotalVolume,
        MAX(ServiceVolume) AS MaxVolume
    FROM MonthlySales
)
SELECT 
    ms.Period AS 'Период',
    ms.ServiceCount AS 'Количество услуг',
    ms.ServiceVolume AS 'Объем услуг за период',
    ts.TotalVolume AS 'Общий объем услуг',
    CAST(ms.ServiceVolume * 100.0 / NULLIF(ts.TotalVolume, 0) AS DECIMAL(5,2)) AS 'Процент от общего объема (%)',
    ts.MaxVolume AS 'Максимальный объем услуг за период',
    CAST(ms.ServiceVolume * 100.0 / NULLIF(ts.MaxVolume, 0) AS DECIMAL(5,2)) AS 'Процент от максимума (%)'
FROM MonthlySales ms
CROSS JOIN TotalStats ts
ORDER BY ms.Period;
GO


-- 5. ROW_NUMBER() для пагинации (по 20 строк)
DECLARE @PageNumber INT = 1;
DECLARE @PageSize INT = 20;

WITH PaginatedTours AS (
    SELECT 
        t.id,
        t.title,
        t.base_price,
        t.duration_days,
        t.departure_date,
        c.name AS Страна,
        ROW_NUMBER() OVER (ORDER BY t.id) AS RowNum
    FROM Tour t
    INNER JOIN Country c ON t.country_id = c.id
    WHERE t.is_active = 1
)
SELECT 
    id AS 'ID',
    title AS 'Название тура',
    base_price AS 'Цена (руб.)',
    duration_days AS 'Длительность (дней)',
    departure_date AS 'Дата отправления',
    Страна AS 'Страна назначения',
    RowNum AS 'Номер строки',
    (RowNum - 1) / @PageSize + 1 AS 'Номер страницы'
FROM PaginatedTours
WHERE RowNum BETWEEN (@PageNumber - 1) * @PageSize + 1 AND @PageNumber * @PageSize
ORDER BY RowNum;
GO


-- 6. ROW_NUMBER() для удаления дубликатов
CREATE TABLE #TempOrderStatus (
    id INT IDENTITY(1,1),
    name NVARCHAR(50),
    description NVARCHAR(MAX),
    is_final BIT
);

INSERT INTO #TempOrderStatus (name, description, is_final) VALUES
('pending', 'Ожидание подтверждения', 0),
('pending', 'Ожидание подтверждения (ДУБЛИКАТ 1)', 0),
('pending', 'Ожидание подтверждения (ДУБЛИКАТ 2)', 0),
('confirmed', 'Подтверждено', 0),
('confirmed', 'Подтверждено (ДУБЛИКАТ)', 0),
('paid', 'Оплачено', 0),
('completed', 'Завершено', 1),
('cancelled', 'Отменено', 1);


SELECT name, COUNT(*) AS DuplicateCount
FROM #TempOrderStatus
GROUP BY name
HAVING COUNT(*) > 1;

WITH DuplicateStatus AS (
    SELECT 
        id,
        name,
        ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS RowNum
    FROM #TempOrderStatus
)
DELETE FROM #TempOrderStatus
WHERE id IN (SELECT id FROM DuplicateStatus WHERE RowNum > 1);

SELECT name, COUNT(*) AS FinalCount
FROM #TempOrderStatus
GROUP BY name
ORDER BY name;


DROP TABLE #TempOrderStatus;




-- 7. Для каждого клиента - 6 самых посещаемых стран
WITH Top6Countries AS (
    SELECT TOP 6 
        c.name AS Страна,
        COUNT(b.id) AS ОбщаяПопулярность
    FROM Country c
    INNER JOIN Tour t ON c.id = t.country_id
    INNER JOIN Booking b ON t.id = b.tour_id
    INNER JOIN OrderStatus os ON b.status_id = os.id
    WHERE os.name IN ('completed', 'paid')
    GROUP BY c.name
    ORDER BY ОбщаяПопулярность DESC
),
AllClients AS (
    SELECT 
        u.id AS ClientId,
        u.first_name + ' ' + u.last_name AS Клиент
    FROM [User] u
    INNER JOIN Client cl ON u.id = cl.user_id
    WHERE u.role = 'client'
),
ClientVisits AS (
    SELECT 
        u.id AS ClientId,
        c.name AS Страна,
        COUNT(b.id) AS КоличествоПосещений
    FROM [User] u
    INNER JOIN Client cl ON u.id = cl.user_id
    LEFT JOIN Booking b ON cl.user_id = b.client_id
    LEFT JOIN Tour t ON b.tour_id = t.id
    LEFT JOIN Country c ON t.country_id = c.id
    LEFT JOIN OrderStatus os ON b.status_id = os.id AND os.name IN ('completed', 'paid')
    WHERE u.role = 'client'
    GROUP BY u.id, c.name
)
SELECT 
    ac.Клиент AS 'Клиент',
    t6.Страна AS 'Страна',
    ISNULL(cv.КоличествоПосещений, 0) AS 'Количество посещений',
    CASE 
        WHEN cv.КоличествоПосещений > 0 
         THEN ROW_NUMBER() OVER (PARTITION BY ac.ClientId ORDER BY cv.КоличествоПосещений DESC)
         ELSE NULL 
    END AS 'Ранг у клиента',
    t6.ОбщаяПопулярность AS 'Общая популярность страны',
    CASE 
        WHEN cv.КоличествоПосещений = 0 THEN 'Нет посещений'
        WHEN cv.КоличествоПосещений > 0 AND 
             ROW_NUMBER() OVER (PARTITION BY ac.ClientId ORDER BY cv.КоличествоПосещений DESC) = 1 THEN 'Самая популярная'
        ELSE 'Посещалась'
    END AS 'Статус'
FROM AllClients ac
CROSS JOIN Top6Countries t6
LEFT JOIN ClientVisits cv ON cv.ClientId = ac.ClientId AND cv.Страна = t6.Страна
ORDER BY ac.Клиент, t6.ОбщаяПопулярность DESC;
GO


-- 8. Какой маршрут включает наибольшее число достопримечательностей определенного вида
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Attraction')
BEGIN
    CREATE TABLE Attraction (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(200) NOT NULL,
        type NVARCHAR(100) NOT NULL,
        country_id INT NOT NULL,
        FOREIGN KEY (country_id) REFERENCES Country(id)
    );
    
    INSERT INTO Attraction (name, type, country_id) VALUES
    (N'Голубая мечеть', N'Религиозный', 1),
    (N'Айя-София', N'Религиозный', 1),
    (N'Пирамиды Гизы', N'Древний', 2),
    (N'Колизей', N'Древний', 3),
    (N'Ватикан', N'Религиозный', 3);
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TourAttraction')
BEGIN
    CREATE TABLE TourAttraction (
        tour_id INT NOT NULL,
        attraction_id INT NOT NULL,
        PRIMARY KEY (tour_id, attraction_id),
        FOREIGN KEY (tour_id) REFERENCES Tour(id),
        FOREIGN KEY (attraction_id) REFERENCES Attraction(id)
    );
    
    INSERT INTO TourAttraction (tour_id, attraction_id) VALUES
    (1, 1), (1, 2), (2, 3), (3, 4), (3, 5);
END;

WITH AttractionCount AS (
    SELECT 
        a.type AS ВидДостопримечательности,
        t.id AS TourId,
        t.title AS Маршрут,
        COUNT(*) AS Количество,
        RANK() OVER (PARTITION BY a.type ORDER BY COUNT(*) DESC) AS RankInType
    FROM Attraction a
    INNER JOIN TourAttraction ta ON a.id = ta.attraction_id
    INNER JOIN Tour t ON ta.tour_id = t.id
    GROUP BY a.type, t.id, t.title
)
SELECT 
    ВидДостопримечательности AS 'Вид достопримечательностей',
    Маршрут AS 'Название маршрута',
    Количество AS 'Количество достопримечательностей',
    RankInType AS 'Ранг в категории',
    CASE 
        WHEN RankInType = 1 THEN 'Лидер в категории'
        ELSE ''
    END AS 'Примечание'
FROM AttractionCount
WHERE RankInType = 1
ORDER BY ВидДостопримечательности;
GO














-- Добавляем бронирования для Италии, Таиланда, ОАЭ
INSERT INTO Booking (booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price)
VALUES 
('BNK-2025-009', 1, 3, 4, '2024-06-01', 4, 2, 1800.00),  -- Италия (tour_id=3)
('BNK-2025-010', 2, 4, 5, '2024-06-05', 4, 2, 5000.00),  -- Таиланд (tour_id=4)
('BNK-2025-011', 3, 6, 4, '2024-06-10', 4, 1, 1800.00),  -- ОАЭ (tour_id=6)
('BNK-2025-012', 1, 3, 4, '2024-06-15', 4, 1, 900.00),   -- Еще Италия
('BNK-2025-013', 2, 4, 5, '2024-06-20', 4, 3, 7500.00);  -- Еще Таиланд

-- Проверяем снова
SELECT TOP 6 
    c.name AS Страна,
    COUNT(b.id) AS ОбщаяПопулярность
FROM Country c
INNER JOIN Tour t ON c.id = t.country_id
INNER JOIN Booking b ON t.id = b.tour_id
INNER JOIN OrderStatus os ON b.status_id = os.id
WHERE os.name IN ('completed', 'paid')
GROUP BY c.name
ORDER BY ОбщаяПопулярность DESC;