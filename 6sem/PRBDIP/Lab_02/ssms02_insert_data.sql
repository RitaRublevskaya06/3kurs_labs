USE TravelAgency;
GO

-- =====================================================
-- ОЧИСТКА ТАБЛИЦ
-- =====================================================
DELETE FROM Review;
DELETE FROM Payment;
DELETE FROM Booking;
DELETE FROM Tour;
DELETE FROM Flight;
DELETE FROM TourType;
DELETE FROM Hotel;
DELETE FROM Country;
DELETE FROM Manager;
DELETE FROM Client;
DELETE FROM [User];
DELETE FROM OrderStatus;
GO

DBCC CHECKIDENT ('[User]', RESEED, 0);
DBCC CHECKIDENT ('Country', RESEED, 0);
DBCC CHECKIDENT ('Hotel', RESEED, 0);
DBCC CHECKIDENT ('TourType', RESEED, 0);
DBCC CHECKIDENT ('Flight', RESEED, 0);
DBCC CHECKIDENT ('Tour', RESEED, 0);
DBCC CHECKIDENT ('OrderStatus', RESEED, 0);
DBCC CHECKIDENT ('Booking', RESEED, 0);
DBCC CHECKIDENT ('Payment', RESEED, 0);
DBCC CHECKIDENT ('Review', RESEED, 0);
GO

-- =====================================================
-- 1. СНАЧАЛА OrderStatus
-- =====================================================
INSERT INTO OrderStatus (name, description, is_final) VALUES
('pending', 'Ожидание подтверждения', 0),
('confirmed', 'Подтверждено менеджером', 0),
('paid', 'Оплачено клиентом', 0),
('completed', 'Тур завершен', 1),
('cancelled', 'Отменено клиентом', 1),
('rejected', 'Отклонено менеджером', 1);
GO

-- =====================================================
-- 2. Country (Страны)
-- =====================================================
INSERT INTO Country (name, code, visa_required, description, is_popular) VALUES
(N'Турция', 'TR', 0, N'Прекрасный отдых на средиземном море, отели All Inclusive', 1),
(N'Египет', 'EG', 1, N'Красное море, пирамиды, дайвинг', 1),
(N'Италия', 'IT', 1, N'Рим, Венеция, Флоренция, отличная кухня', 1),
(N'Таиланд', 'TH', 0, N'Экзотический отдых, острова, слоновьи фермы', 1),
(N'Греция', 'GR', 1, N'Санторини, Афины, крит, оливки', 0),
(N'ОАЭ', 'AE', 0, N'Дубай, шоппинг, небоскребы', 1);
GO

SELECT * FROM Country;
GO

-- =====================================================
-- 3. Hotel (Отели)
-- =====================================================
INSERT INTO Hotel (name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES
(N'Rixos Premium Belek', 1, N'Анталья', 5, 'AI', 4.8, N'Belek Turizm Merkezi', '+905551234567'),
(N'Hilton Hurghada Resort', 2, N'Хургада', 5, 'HB', 4.5, N'Sahl Hasheesh', '+201234567890'),
(N'Best Western Hotel Roma', 3, N'Рим', 4, 'BB', 4.2, N'Via Nazionale 123', '+390612345678'),
(N'Phi Phi Island Village', 4, N'Краби', 4, 'FB', 4.9, N'Phi Phi Islands', '+66897654321'),
(N'Grecotel Grand Hotel', 5, N'Крит', 5, 'HB', 4.7, N'Hersonissos', '+302810123456'),
(N'Burj Al Arab', 6, N'Дубай', 5, 'AI', 5.0, N'Jumeirah Beach', '+97141234567'),
(N'Voyage Belek', 1, N'Анталья', 5, 'AI', 4.9, N'Belek', '+905557654321'),
(N'Athens Plaza Hotel', 5, N'Афины', 4, 'BB', 4.3, N'Syntagma Square', '+302101234567');
GO

SELECT * FROM Hotel;
GO

-- =====================================================
-- 4. TourType (Типы туров)
-- =====================================================
INSERT INTO TourType (name, description, seasonality, activity_level) VALUES
(N'Пляжный', N'Отдых на море, бассейн, расслабление', 'summer', 'low'),
(N'Экскурсионный', N'Посещение достопримечательностей, музеи', 'all', 'medium'),
(N'Экстремальный', N'Дайвинг, треккинг, сафари', 'winter', 'high'),
(N'Горнолыжный', N'Катание на лыжах, сноуборд', 'winter', 'high'),
(N'Лечебный', N'Санатории, оздоровление, спа', 'all', 'low');
GO

-- =====================================================
-- 5. Flight (Рейсы)
-- =====================================================
INSERT INTO Flight (airline, flight_number, departure_airport, arrival_airport, departure_datetime, arrival_datetime, flight_class, is_included) VALUES
(N'Turkish Airlines', 'TK123', N'MSQ (Минск)', N'AYT (Анталья)', '2024-06-15 10:00', '2024-06-15 13:30', 'economy', 1),
(N'Egypt Air', 'MS456', N'MSQ (Минск)', N'HRG (Хургада)', '2024-06-20 08:30', '2024-06-20 12:00', 'economy', 1),
(N'Belavia', 'B2789', N'MSQ (Минск)', N'FCO (Рим)', '2024-07-01 15:45', '2024-07-01 17:30', 'economy', 1),
(N'Qatar Airways', 'QR1234', N'MSQ (Минск)', N'DOH (Доха)', '2024-07-10 11:20', '2024-07-10 18:45', 'business', 0),
(N'Emirates', 'EK789', N'DXB (Дубай)', N'BKK (Бангкок)', '2024-07-15 09:30', '2024-07-15 18:30', 'economy', 0),
(N'Aegean Airlines', 'A3456', N'MSQ (Минск)', N'ATH (Афины)', '2024-08-01 13:15', '2024-08-01 15:30', 'economy', 1);
GO

-- =====================================================
-- 6. [User] (Пользователи)
-- =====================================================
INSERT INTO [User] (email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES
('ivan.ivanov@mail.com', 'hash_ivan123', N'Иван', N'Иванов', '+375291234567', '2023-01-10', '2024-05-20 10:30', 'client'),
('maria.petrova@mail.com', 'hash_maria456', N'Мария', N'Петрова', '+375297654321', '2023-02-15', '2024-05-21 15:45', 'client'),
('petr.sidorov@mail.com', 'hash_petr789', N'Петр', N'Сидоров', '+375331122334', '2024-03-20', '2024-05-19 09:15', 'client'),
('anna.smirnova@travel.com', 'hash_anna001', N'Анна', N'Смирнова', '+375291112233', '2022-01-15', '2024-05-22 08:00', 'manager'),
('sergey.kozlov@travel.com', 'hash_sergey002', N'Сергей', N'Козлов', '+375293334455', '2022-03-20', '2024-05-21 16:20', 'manager'),
('elena.kovaleva@mail.com', 'hash_elena111', N'Елена', N'Ковалева', '+375336667788', '2023-11-05', '2024-05-18 14:10', 'client'),
('dmitry.novik@mail.com', 'hash_dmitry222', N'Дмитрий', N'Новик', '+375299998877', '2024-01-25', '2024-05-17 11:30', 'client'),
('olga.zayceva@mail.com', 'hash_olga333', N'Ольга', N'Зайцева', '+375253334455', '2023-09-12', '2024-05-20 18:50', 'client');
GO

-- =====================================================
-- 7. Client (Клиенты)
-- =====================================================
INSERT INTO Client (user_id, passport_number, passport_issue_date, passport_expiry_date, date_of_birth, loyalty_points, client_since) VALUES
(1, 'MP1234567', '2020-05-15', '2030-05-15', '1990-03-12', 150, '2023-01-15'),
(2, 'MP7654321', '2021-08-20', '2031-08-20', '1985-07-25', 75, '2023-02-20'),
(3, 'MP3344556', '2022-01-10', '2032-01-10', '1995-11-02', 0, '2024-03-25'),
(6, 'MP9988776', '2020-11-15', '2030-11-15', '1992-04-18', 220, '2023-11-10'),
(7, 'MP5566778', '2021-03-22', '2031-03-22', '1988-09-30', 50, '2024-01-28');
GO

-- =====================================================
-- 8. Manager (Менеджеры)
-- =====================================================
INSERT INTO Manager (user_id, employee_id, hire_date, department, commission_rate) VALUES
(4, 'EMP001', '2022-01-15', N'Sales (Продажи)', 5.0),
(5, 'EMP002', '2022-03-20', N'Customer Support', 3.5);
GO

-- =====================================================
-- 9. Tour (Туры)
-- =====================================================
INSERT INTO Tour (title, description, tour_type_id, country_id, hotel_id, flight_id, duration_days, departure_date, base_price, available_seats, is_active, created_at) VALUES
(N'Сказочная Анталья', N'Отличный отдых в Турции с семьей', 1, 1, 1, 1, 7, '2024-06-16', 1200.00, 10, 1, '2024-01-15'),
(N'Египетские каникулы', N'Отдых в Хургаде, дайвинг', 1, 2, 2, 2, 10, '2024-06-21', 1500.00, 5, 1, '2024-01-20'),
(N'Римские каникулы', N'Экскурсии по Риму, Колизей, Ватикан', 2, 3, 3, 3, 5, '2024-07-02', 900.00, 8, 1, '2024-02-10'),
(N'Райский Пхукет', N'Экзотический отдых в Таиланде', 1, 4, 4, 4, 14, '2024-07-15', 2500.00, 6, 1, '2024-02-15'),
(N'Горнолыжный Куршевель', N'Элитный горнолыжный отдых', 4, 5, 5, 6, 7, '2024-12-10', 3500.00, 4, 1, '2024-03-01'),
(N'Дубайский шоппинг', N'Шоппинг тур в ОАЭ', 2, 6, 6, 5, 4, '2024-08-05', 1800.00, 7, 1, '2024-03-10');
GO

-- =====================================================
-- 10. Booking (Бронирования)
-- =====================================================
INSERT INTO Booking (booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES
('BK-2024-001', 1, 1, 4, '2024-05-10', 2, 2, 2400.00),
('BK-2024-002', 2, 2, 4, '2024-05-12', 3, 1, 1500.00),
('BK-2024-003', 3, 3, 5, '2024-05-15', 1, 2, 1800.00),
('BK-2024-004', 6, 4, 5, '2024-05-16', 2, 3, 7500.00),
('BK-2024-005', 1, 5, 4, '2024-05-18', 4, 2, 7000.00),
('BK-2024-006', 7, 6, 5, '2024-05-19', 5, 1, 1800.00),
('BK-2024-007', 2, 1, 4, '2024-05-20', 2, 2, 2400.00),
('BK-2024-008', 6, 2, 4, '2024-05-21', 3, 2, 3000.00);
GO

-- =====================================================
-- 11. Payment (Платежи)
-- =====================================================
INSERT INTO Payment (booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES
(1, 2400.00, '2024-05-10 14:30', 'card', 'completed', 'TXN001234567'),
(2, 1500.00, '2024-05-12 10:15', 'transfer', 'completed', 'TXN001234568'),
(3, 900.00, '2024-05-15 16:45', 'card', 'pending', 'TXN001234569'),
(4, 5000.00, '2024-05-16 09:30', 'card', 'completed', 'TXN001234570'),
(4, 2500.00, '2024-05-17 11:20', 'card', 'completed', 'TXN001234571'),
(5, 7000.00, '2024-05-18 12:00', 'transfer', 'completed', 'TXN001234572'),
(6, 1800.00, '2024-05-19 08:45', 'card', 'refunded', 'TXN001234573'),
(8, 3000.00, '2024-05-21 15:30', 'cash', 'completed', 'TXN001234574');
GO

-- =====================================================
-- 12. Review (Отзывы)
-- =====================================================
INSERT INTO Review (booking_id, client_id, tour_id, rating, comment, created_at, is_approved) VALUES
(5, 1, 5, 5, N'Отличный тур! Отель супер, все понравилось!', '2024-05-25', 1),
(2, 2, 2, 4, N'Хороший отдых, но еда могла бы быть лучше', '2024-05-20', 1),
(1, 1, 1, 5, N'Прекрасный отель, море рядом, анимация на высоте!', '2024-05-18', 1),
(4, 6, 4, 5, N'Таиланд это сказка! Обязательно вернемся!', '2024-05-22', 0),
(7, 2, 1, 4, N'Хороший тур, но рейс задержали', '2024-05-23', 1),
(8, 6, 2, 3, N'Нормально, но ожидала большего от Египта', '2024-05-24', 1);
GO

-- =====================================================
-- ПРОВЕРКА ЗАПОЛНЕНИЯ
-- =====================================================
SELECT 'User', COUNT(*) FROM [User]
UNION ALL
SELECT 'Client', COUNT(*) FROM Client
UNION ALL
SELECT 'Manager', COUNT(*) FROM Manager
UNION ALL
SELECT 'Country', COUNT(*) FROM Country
UNION ALL
SELECT 'Hotel', COUNT(*) FROM Hotel
UNION ALL
SELECT 'TourType', COUNT(*) FROM TourType
UNION ALL
SELECT 'Flight', COUNT(*) FROM Flight
UNION ALL
SELECT 'Tour', COUNT(*) FROM Tour
UNION ALL
SELECT 'OrderStatus', COUNT(*) FROM OrderStatus
UNION ALL
SELECT 'Booking', COUNT(*) FROM Booking
UNION ALL
SELECT 'Payment', COUNT(*) FROM Payment
UNION ALL
SELECT 'Review', COUNT(*) FROM Review
ORDER BY 1;
GO