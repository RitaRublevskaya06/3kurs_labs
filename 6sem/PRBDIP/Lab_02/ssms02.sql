CREATE DATABASE TravelAgency;
GO

USE TravelAgency;
GO

-- =====================================================
-- 1. СОЗДАНИЕ ТАБЛИЦ
-- =====================================================
-- Таблица 1: User (Пользователи)
CREATE TABLE [User] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    registration_date DATETIME2 DEFAULT GETDATE(),
    last_login DATETIME2,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('client', 'manager'))
);

-- Таблица 2: Client (Клиенты)
CREATE TABLE Client (
    user_id INT PRIMARY KEY,
    passport_number NVARCHAR(50) NOT NULL,
    passport_issue_date DATE NOT NULL,
    passport_expiry_date DATE NOT NULL,
    date_of_birth DATE NOT NULL,
    loyalty_points INT DEFAULT 0,
    client_since DATE,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE
);

-- Таблица 3: Manager (Менеджеры)
CREATE TABLE Manager (
    user_id INT PRIMARY KEY,
    employee_id NVARCHAR(20) NOT NULL UNIQUE,
    hire_date DATE NOT NULL,
    department NVARCHAR(100),
    commission_rate DECIMAL(5,2) DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE
);

-- Таблица 4: Country (Страны)
CREATE TABLE Country (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    code CHAR(2) UNIQUE,
    visa_required BIT DEFAULT 0,
    description NVARCHAR(MAX),
    is_popular BIT DEFAULT 0
);

-- Таблица 5: Hotel (Отели)
CREATE TABLE Hotel (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    country_id INT NOT NULL,
    city NVARCHAR(100) NOT NULL,
    stars INT CHECK (stars BETWEEN 1 AND 5),
    food_type NVARCHAR(50) CHECK (food_type IN ('RO', 'BB', 'HB', 'FB', 'AI')),
    rating DECIMAL(3,1) CHECK (rating BETWEEN 0 AND 5),
    address NVARCHAR(MAX),
    contact_phone NVARCHAR(20),
    FOREIGN KEY (country_id) REFERENCES Country(id)
);

-- Таблица 6: TourType (Типы туров)
CREATE TABLE TourType (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    seasonality NVARCHAR(20) CHECK (seasonality IN ('summer', 'winter', 'all')),
    activity_level NVARCHAR(20) CHECK (activity_level IN ('low', 'medium', 'high'))
);

-- Таблица 7: Flight (Рейсы)
CREATE TABLE Flight (
    id INT IDENTITY(1,1) PRIMARY KEY,
    airline NVARCHAR(150) NOT NULL,
    flight_number NVARCHAR(10) NOT NULL,
    departure_airport NVARCHAR(100) NOT NULL,
    arrival_airport NVARCHAR(100) NOT NULL,
    departure_datetime DATETIME2 NOT NULL,
    arrival_datetime DATETIME2 NOT NULL,
    flight_class NVARCHAR(50) CHECK (flight_class IN ('economy', 'business', 'first')),
    is_included BIT DEFAULT 1
);

-- Таблица 8: Tour (Туры)
CREATE TABLE Tour (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    tour_type_id INT,
    country_id INT NOT NULL,
    hotel_id INT NOT NULL,
    flight_id INT,
    duration_days INT NOT NULL,
    departure_date DATE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    available_seats INT NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (tour_type_id) REFERENCES TourType(id),
    FOREIGN KEY (country_id) REFERENCES Country(id),
    FOREIGN KEY (hotel_id) REFERENCES Hotel(id),
    FOREIGN KEY (flight_id) REFERENCES Flight(id)
);

-- Таблица 9: OrderStatus (Статусы заказов)
CREATE TABLE OrderStatus (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    is_final BIT DEFAULT 0
);

-- Таблица 10: Booking (Заказы/Бронирования)
CREATE TABLE Booking (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_number NVARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    tour_id INT NOT NULL,
    manager_id INT,
    booking_date DATETIME2 DEFAULT GETDATE(),
    status_id INT NOT NULL,
    persons_count INT DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES Client(user_id),
    FOREIGN KEY (tour_id) REFERENCES Tour(id),
    FOREIGN KEY (manager_id) REFERENCES Manager(user_id),
    FOREIGN KEY (status_id) REFERENCES OrderStatus(id)
);

-- Таблица 11: Payment (Платежи)
CREATE TABLE Payment (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME2 DEFAULT GETDATE(),
    payment_method NVARCHAR(50) NOT NULL CHECK (payment_method IN ('card', 'transfer', 'cash')),
    status NVARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id NVARCHAR(255),
    FOREIGN KEY (booking_id) REFERENCES Booking(id)
);

-- Таблица 12: Review (Отзывы)
CREATE TABLE Review (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    client_id INT NOT NULL,
    tour_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    is_approved BIT DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES Booking(id),
    FOREIGN KEY (client_id) REFERENCES Client(user_id),
    FOREIGN KEY (tour_id) REFERENCES Tour(id)
);
GO

-- =====================================================
-- 2. ИНДЕКСЫ
-- =====================================================
CREATE INDEX IX_Tour_Country ON Tour(country_id);
CREATE INDEX IX_Tour_DepartureDate ON Tour(departure_date);
CREATE INDEX IX_Booking_Client ON Booking(client_id);
CREATE INDEX IX_Booking_Status ON Booking(status_id);
CREATE INDEX IX_Payment_Booking ON Payment(booking_id);
GO

-- =====================================================
-- 3. ПРЕДСТАВЛЕНИЯ (VIEWS)
-- =====================================================
-- Представление для отображения активных туров с деталями
CREATE VIEW vActiveTours AS
SELECT 
    t.id AS TourId,
    t.title,
    t.base_price,
    t.duration_days,
    t.departure_date,
    t.available_seats,
    c.name AS Country,
    h.name AS Hotel,
    h.stars,
    tt.name AS TourType
FROM Tour t
INNER JOIN Country c ON t.country_id = c.id
INNER JOIN Hotel h ON t.hotel_id = h.id
LEFT JOIN TourType tt ON t.tour_type_id = tt.id
WHERE t.is_active = 1;
GO

-- Представление для отчета по бронированиям
CREATE VIEW vBookingReport AS
SELECT 
    b.booking_number,
    u.first_name + ' ' + u.last_name AS ClientName,
    t.title AS TourTitle,
    b.booking_date,
    os.name AS Status,
    b.persons_count,
    b.total_price,
    p.amount AS PaidAmount,
    p.status AS PaymentStatus
FROM Booking b
INNER JOIN Client c ON b.client_id = c.user_id
INNER JOIN [User] u ON c.user_id = u.id
INNER JOIN Tour t ON b.tour_id = t.id
INNER JOIN OrderStatus os ON b.status_id = os.id
LEFT JOIN Payment p ON b.id = p.booking_id;
GO

-- =====================================================
-- 4. ТРИГГЕРЫ (TRIGGERS)
-- =====================================================
-- Триггер для обновления рейтинга отеля при добавлении нового отзыва
CREATE TRIGGER trg_UpdateHotelRating
ON Review
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Hotel
    SET rating = (
        SELECT AVG(CAST(r.rating AS DECIMAL(3,1)))
        FROM Review r
        INNER JOIN Booking b ON r.booking_id = b.id
        WHERE b.tour_id IN (SELECT id FROM Tour WHERE hotel_id = Hotel.id)
        AND r.is_approved = 1
    )
    WHERE id IN (
        SELECT DISTINCT t.hotel_id
        FROM inserted i
        INNER JOIN Booking b ON i.booking_id = b.id
        INNER JOIN Tour t ON b.tour_id = t.id
    );
END;
GO

-- =====================================================
-- 5. ХРАНИМЫЕ ПРОЦЕДУРЫ (PROCEDURES)
-- =====================================================
-- Процедура 1: Получение статистики клиента
CREATE PROCEDURE sp_GetClientStatistics
    @ClientID INT
AS
BEGIN
    SELECT 
        SUM(b.total_price) AS TotalSpent,
        COUNT(DISTINCT b.id) AS TotalBookings,
        AVG(b.total_price) AS AverageCheck
    FROM Booking b
    INNER JOIN OrderStatus os ON b.status_id = os.id
    WHERE b.client_id = @ClientID AND os.name = 'completed';
END;
GO

-- Процедура 2: Изменение статуса бронирования
CREATE PROCEDURE sp_ChangeBookingStatus
    @BookingNumber NVARCHAR(50),
    @NewStatusName NVARCHAR(50)
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @CurrentStatusId INT, @NewStatusId INT, @IsFinal BIT;
        
        SELECT @CurrentStatusId = b.status_id, @IsFinal = os.is_final
        FROM Booking b
        INNER JOIN OrderStatus os ON b.status_id = os.id
        WHERE b.booking_number = @BookingNumber;
        
        IF @IsFinal = 1
        BEGIN
            RAISERROR('Cannot change status of a booking that is in a final state.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        SELECT @NewStatusId = id FROM OrderStatus WHERE name = @NewStatusName;
        
        IF @NewStatusId IS NULL
        BEGIN
            RAISERROR('Invalid status name provided.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        UPDATE Booking SET status_id = @NewStatusId WHERE booking_number = @BookingNumber;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Процедура 3: Поиск туров
CREATE PROCEDURE sp_SearchTours
    @CountryName NVARCHAR(100) = NULL,
    @MinPrice DECIMAL(10,2) = NULL,
    @MaxPrice DECIMAL(10,2) = NULL,
    @StartDate DATE = NULL,
    @Duration INT = NULL
AS
BEGIN
    SELECT 
        t.id, t.title, t.base_price, t.duration_days, t.departure_date,
        c.name AS Country, h.name AS Hotel
    FROM Tour t
    INNER JOIN Country c ON t.country_id = c.id
    INNER JOIN Hotel h ON t.hotel_id = h.id
    WHERE t.is_active = 1
        AND (@CountryName IS NULL OR c.name LIKE '%' + @CountryName + '%')
        AND (@MinPrice IS NULL OR t.base_price >= @MinPrice)
        AND (@MaxPrice IS NULL OR t.base_price <= @MaxPrice)
        AND (@StartDate IS NULL OR t.departure_date >= @StartDate)
        AND (@Duration IS NULL OR t.duration_days = @Duration);
END;
GO

-- Процедура 4: Отмена бронирования
CREATE PROCEDURE sp_CancelBooking
    @BookingNumber NVARCHAR(50)
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @CancelledStatusId INT, @BookingId INT, @PaymentStatus NVARCHAR(50);
        
        SELECT @CancelledStatusId = id FROM OrderStatus WHERE name = 'cancelled';
        SELECT @BookingId = id FROM Booking WHERE booking_number = @BookingNumber;
        
        UPDATE Booking SET status_id = @CancelledStatusId WHERE booking_number = @BookingNumber;
        
        UPDATE Payment 
        SET status = 'refunded' 
        WHERE booking_id = @BookingId AND status = 'completed';
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Процедура 5: Расчет комиссии менеджера
CREATE PROCEDURE sp_GetManagerCommission
    @ManagerID INT,
    @StartDate DATE,
    @EndDate DATE,
    @TotalCommission DECIMAL(10,2) OUTPUT
AS
BEGIN
    SELECT @TotalCommission = SUM(b.total_price * m.commission_rate / 100)
    FROM Booking b
    INNER JOIN Manager m ON b.manager_id = m.user_id
    INNER JOIN OrderStatus os ON b.status_id = os.id
    WHERE b.manager_id = @ManagerID
        AND os.name = 'completed'
        AND b.booking_date BETWEEN @StartDate AND @EndDate;
    
    IF @TotalCommission IS NULL
        SET @TotalCommission = 0;
END;
GO

-- =====================================================
-- 6. ФУНКЦИИ (FUNCTIONS)
-- =====================================================
-- Функция 1: Получение возраста клиента
CREATE FUNCTION fn_GetClientAge (@ClientID INT)
RETURNS INT
AS
BEGIN
    DECLARE @Age INT;
    
    SELECT @Age = DATEDIFF(YEAR, date_of_birth, GETDATE()) - 
                  CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, date_of_birth, GETDATE()), date_of_birth) > GETDATE() 
                  THEN 1 ELSE 0 END
    FROM Client
    WHERE user_id = @ClientID;
    
    RETURN @Age;
END;
GO

-- Функция 2: Проверка доступности мест
CREATE FUNCTION fn_CheckSeatAvailability (@TourID INT, @RequestedSeats INT)
RETURNS BIT
AS
BEGIN
    DECLARE @Available BIT = 0;
    
    IF EXISTS (SELECT 1 FROM Tour WHERE id = @TourID AND available_seats >= @RequestedSeats)
        SET @Available = 1;
    
    RETURN @Available;
END;
GO

-- Функция 3: Прибыльность тура
CREATE FUNCTION fn_GetTourProfitability (@TourID INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @Profit DECIMAL(10,2);
    
    SELECT @Profit = SUM(p.amount) - (t.base_price * COUNT(DISTINCT b.id))
    FROM Tour t
    LEFT JOIN Booking b ON t.id = b.tour_id
    LEFT JOIN Payment p ON b.id = p.booking_id AND p.status = 'completed'
    WHERE t.id = @TourID
    GROUP BY t.base_price;
    
    RETURN ISNULL(@Profit, 0);
END;
GO

-- Функция 4: Табличная функция - рейтинг отелей
CREATE FUNCTION fn_GetHotelRating ()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        h.id,
        h.name AS HotelName,
        AVG(CAST(r.rating AS DECIMAL(3,1))) AS AvgRating,
        COUNT(r.id) AS ReviewCount
    FROM Hotel h
    LEFT JOIN Tour t ON h.id = t.hotel_id
    LEFT JOIN Booking b ON t.id = b.tour_id
    LEFT JOIN Review r ON b.id = r.booking_id AND r.is_approved = 1
    GROUP BY h.id, h.name
);
GO

-- Функция 5: Форматирование имени клиента
CREATE FUNCTION fn_FormatClientName (@ClientID INT)
RETURNS NVARCHAR(255)
AS
BEGIN
    DECLARE @FormattedName NVARCHAR(255);
    
    SELECT @FormattedName = last_name + ' ' + LEFT(first_name, 1) + '.'
    FROM [User] u
    INNER JOIN Client c ON u.id = c.user_id
    WHERE c.user_id = @ClientID;
    
    RETURN @FormattedName;
END;
GO


-- Функция 1: Количество завершенных бронирований клиента
CREATE FUNCTION fn_GetClientCompletedBookings (@ClientID INT)
RETURNS INT
AS
BEGIN
    DECLARE @BookingsCount INT;
    
    SELECT @BookingsCount = COUNT(b.id)
    FROM Booking b
    INNER JOIN OrderStatus os ON b.status_id = os.id
    WHERE b.client_id = @ClientID AND os.name = 'completed';
    
    RETURN ISNULL(@BookingsCount, 0);
END;
GO


-- Функция 5: Средняя стоимость туров по стране
CREATE FUNCTION fn_GetAvgTourPriceByCountry (@CountryID INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @AvgPrice DECIMAL(10,2);
    
    SELECT @AvgPrice = AVG(base_price)
    FROM Tour
    WHERE country_id = @CountryID AND is_active = 1;
    
    RETURN ISNULL(@AvgPrice, 0);
END;
GO