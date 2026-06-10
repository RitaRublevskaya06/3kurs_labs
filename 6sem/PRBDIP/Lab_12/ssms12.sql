USE TravelAgency;
GO
---- задание 1
CREATE TABLE Report (
    id INT IDENTITY(1,1) PRIMARY KEY,
    xml_data XML NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

---- задание 2
CREATE OR ALTER PROCEDURE sp_GenerateTourReportXML
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        GETDATE() AS "@ReportGenerated",
        @StartDate AS "@StartDate",
        @EndDate AS "@EndDate",
        (
            SELECT 
                t.id AS "@id",
                t.title AS "Name",
                c.name AS "Country",
                h.name AS "Hotel",
                CONVERT(VARCHAR(10), t.departure_date, 120) AS "DepartureDate",
                t.base_price AS "BasePrice",
                COUNT(b.id) AS "BookingsCount",
                ISNULL(SUM(b.total_price), 0) AS "TotalRevenue",
                CAST(ISNULL(AVG(b.total_price), 0) AS DECIMAL(10,2)) AS "AverageCheck"
            FROM Tour t
            INNER JOIN Country c ON t.country_id = c.id
            INNER JOIN Hotel h ON t.hotel_id = h.id
            LEFT JOIN Booking b ON t.id = b.tour_id
            WHERE t.departure_date BETWEEN @StartDate AND @EndDate
            GROUP BY t.id, t.title, c.name, h.name, t.departure_date, t.base_price
            FOR XML PATH('Tour'), TYPE
        )
    FOR XML PATH('ToursReport');
END;
GO

-- Проверка
EXEC sp_GenerateTourReportXML '2024-06-01', '2024-12-31';



---- задание 3 вставка
CREATE OR ALTER PROCEDURE sp_InsertXMLReport
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Report (xml_data)
    SELECT 
        (
            SELECT 
                GETDATE() AS "@ReportGenerated",
                @StartDate AS "@StartDate",
                @EndDate AS "@EndDate",
                (
                    SELECT 
                        t.id AS "@id",
                        t.title AS "Name",
                        c.name AS "Country",
                        h.name AS "Hotel",
                        CONVERT(VARCHAR(10), t.departure_date, 120) AS "DepartureDate",
                        t.base_price AS "BasePrice",
                        COUNT(b.id) AS "BookingsCount",
                        ISNULL(SUM(b.total_price), 0) AS "TotalRevenue",
                        CAST(ISNULL(AVG(b.total_price), 0) AS DECIMAL(10,2)) AS "AverageCheck"
                    FROM Tour t
                    INNER JOIN Country c ON t.country_id = c.id
                    INNER JOIN Hotel h ON t.hotel_id = h.id
                    LEFT JOIN Booking b ON t.id = b.tour_id
                    WHERE t.departure_date BETWEEN @StartDate AND @EndDate
                    GROUP BY t.id, t.title, c.name, h.name, t.departure_date, t.base_price
                    FOR XML PATH('Tour'), TYPE
                )
            FOR XML PATH('ToursReport')
        );
    
    SELECT SCOPE_IDENTITY() AS NewReportID;
END;
GO

-- Проверка
EXEC sp_InsertXMLReport '2024-06-01', '2024-12-31';


-- Просмотр результатов
SELECT id, created_at, CAST(xml_data AS NVARCHAR(MAX)) AS xml_text 
FROM Report;



---- задание 4
CREATE PRIMARY XML INDEX IX_Report_XMLData ON Report(xml_data);
GO

-- Вторичные XML-индексы
CREATE XML INDEX IX_Report_XMLData_Path ON Report(xml_data)
USING XML INDEX IX_Report_XMLData FOR PATH;
GO

CREATE XML INDEX IX_Report_XMLData_Value ON Report(xml_data)
USING XML INDEX IX_Report_XMLData FOR VALUE;
GO

CREATE XML INDEX IX_Report_XMLData_Property ON Report(xml_data)
USING XML INDEX IX_Report_XMLData FOR PROPERTY;
GO

-- Проверка индексов
SELECT name, type_desc FROM sys.indexes WHERE object_id = OBJECT_ID('Report');

SELECT id, created_at
FROM Report
WHERE xml_data.exist('/ToursReport/Tour[Name = "Анталья - всё включено"]') = 1;
GO


---- задание 5
CREATE OR ALTER PROCEDURE sp_ExtractXMLValue
    @TourName NVARCHAR(255) = NULL,
    @MinRevenue DECIMAL(10,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.id AS ReportID,
        r.created_at,
        r.xml_data.value('(/ToursReport/@ReportGenerated)[1]', 'DATETIME2') AS ReportGenerated,
        r.xml_data.value('(/ToursReport/@StartDate)[1]', 'DATE') AS StartDate,
        r.xml_data.value('(/ToursReport/@EndDate)[1]', 'DATE') AS EndDate,
        t.tour.value('@id', 'INT') AS TourID,
        t.tour.value('(Name)[1]', 'NVARCHAR(255)') AS TourName,
        t.tour.value('(Country)[1]', 'NVARCHAR(100)') AS Country,
        t.tour.value('(Hotel)[1]', 'NVARCHAR(200)') AS Hotel,
        t.tour.value('(DepartureDate)[1]', 'DATE') AS DepartureDate,
        t.tour.value('(BasePrice)[1]', 'DECIMAL(10,2)') AS BasePrice,
        t.tour.value('(BookingsCount)[1]', 'INT') AS BookingsCount,
        t.tour.value('(TotalRevenue)[1]', 'DECIMAL(10,2)') AS TotalRevenue,
        t.tour.value('(AverageCheck)[1]', 'DECIMAL(10,2)') AS AverageCheck
    FROM Report r
    CROSS APPLY r.xml_data.nodes('/ToursReport/Tour') AS t(tour)
    WHERE (@TourName IS NULL OR t.tour.value('(Name)[1]', 'NVARCHAR(255)') LIKE '%' + @TourName + '%')
      AND (@MinRevenue IS NULL OR t.tour.value('(TotalRevenue)[1]', 'DECIMAL(10,2)') >= @MinRevenue)
    ORDER BY r.id, TotalRevenue DESC;
END;
GO

-- Все туры
EXEC sp_ExtractXMLValue;

-- Только туры с названием "Анталья"
EXEC sp_ExtractXMLValue @TourName = 'Анталья';

-- Туры с выручкой больше 5000
EXEC sp_ExtractXMLValue @MinRevenue = 5000;

-- Комбинированный фильтр
EXEC sp_ExtractXMLValue @TourName = 'Египет', @MinRevenue = 2000;







DROP PROCEDURE IF EXISTS sp_ExtractXMLValue;
DROP PROCEDURE IF EXISTS sp_InsertXMLReport;
DROP PROCEDURE IF EXISTS sp_GenerateTourReportXML;
GO


DROP INDEX IF EXISTS IX_Report_XMLData_Property ON Report;
DROP INDEX IF EXISTS IX_Report_XMLData_Value ON Report;
DROP INDEX IF EXISTS IX_Report_XMLData_Path ON Report;
DROP INDEX IF EXISTS IX_Report_XMLData ON Report;
GO


DROP TABLE IF EXISTS Report;
GO
