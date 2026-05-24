-- =====================================================
-- ОЧИСТКА ТАБЛИЦ (в правильном порядке)
-- =====================================================
BEGIN
    -- Удаляем в правильном порядке (сначала зависимые таблицы)
    EXECUTE IMMEDIATE 'DELETE FROM Review';
    EXECUTE IMMEDIATE 'DELETE FROM Payment';
    EXECUTE IMMEDIATE 'DELETE FROM Booking';
    EXECUTE IMMEDIATE 'DELETE FROM Tour';
    EXECUTE IMMEDIATE 'DELETE FROM Flight';
    EXECUTE IMMEDIATE 'DELETE FROM TourType';
    EXECUTE IMMEDIATE 'DELETE FROM Hotel';
    EXECUTE IMMEDIATE 'DELETE FROM Country';
    EXECUTE IMMEDIATE 'DELETE FROM Manager';
    EXECUTE IMMEDIATE 'DELETE FROM Client';
    EXECUTE IMMEDIATE 'DELETE FROM "User"';
    EXECUTE IMMEDIATE 'DELETE FROM OrderStatus';
    
    -- Сброс последовательностей (установка на 1)
    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_user';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_country';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_hotel';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_tourtype';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_flight';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_tour';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_orderstatus';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_booking';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_payment';
        EXECUTE IMMEDIATE 'DROP SEQUENCE seq_review';
    EXCEPTION
        WHEN OTHERS THEN NULL; -- Игнорируем ошибки, если последовательностей нет
    END;
    
    -- Создаем последовательности заново
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_user START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_country START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_hotel START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_tourtype START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_flight START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_tour START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_orderstatus START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_booking START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_payment START WITH 1 INCREMENT BY 1';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_review START WITH 1 INCREMENT BY 1';
    
    COMMIT;
END;
/

-- =====================================================
-- 1. ЗАПОЛНЕНИЕ OrderStatus (Статусы заказов) - 6 строк
-- =====================================================
INSERT INTO OrderStatus (id, name, description, is_final) VALUES (seq_orderstatus.NEXTVAL, 'pending', 'Ожидание подтверждения', 0);
INSERT INTO OrderStatus (id, name, description, is_final) VALUES (seq_orderstatus.NEXTVAL, 'confirmed', 'Подтверждено менеджером', 0);
INSERT INTO OrderStatus (id, name, description, is_final) VALUES (seq_orderstatus.NEXTVAL, 'paid', 'Оплачено клиентом', 0);
INSERT INTO OrderStatus (id, name, description, is_final) VALUES (seq_orderstatus.NEXTVAL, 'completed', 'Тур завершен', 1);
INSERT INTO OrderStatus (id, name, description, is_final) VALUES (seq_orderstatus.NEXTVAL, 'cancelled', 'Отменено клиентом', 1);
INSERT INTO OrderStatus (id, name, description, is_final) VALUES (seq_orderstatus.NEXTVAL, 'rejected', 'Отклонено менеджером', 1);
COMMIT;

-- =====================================================
-- 2. ЗАПОЛНЕНИЕ Country (Страны) - 6 строк
-- =====================================================
INSERT INTO Country (id, name, code, visa_required, description, is_popular) VALUES (seq_country.NEXTVAL, 'Турция', 'TR', 0, 'Прекрасный отдых на средиземном море, отели All Inclusive', 1);
INSERT INTO Country (id, name, code, visa_required, description, is_popular) VALUES (seq_country.NEXTVAL, 'Египет', 'EG', 1, 'Красное море, пирамиды, дайвинг', 1);
INSERT INTO Country (id, name, code, visa_required, description, is_popular) VALUES (seq_country.NEXTVAL, 'Италия', 'IT', 1, 'Рим, Венеция, Флоренция, отличная кухня', 1);
INSERT INTO Country (id, name, code, visa_required, description, is_popular) VALUES (seq_country.NEXTVAL, 'Таиланд', 'TH', 0, 'Экзотический отдых, острова, слоновьи фермы', 1);
INSERT INTO Country (id, name, code, visa_required, description, is_popular) VALUES (seq_country.NEXTVAL, 'Греция', 'GR', 1, 'Санторини, Афины, крит, оливки', 0);
INSERT INTO Country (id, name, code, visa_required, description, is_popular) VALUES (seq_country.NEXTVAL, 'ОАЭ', 'AE', 0, 'Дубай, шоппинг, небоскребы', 1);
COMMIT;

-- =====================================================
-- 3. ЗАПОЛНЕНИЕ Hotel (Отели) - 8 строк
-- =====================================================
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Rixos Premium Belek', 1, 'Анталья', 5, 'AI', 4.8, 'Belek Turizm Merkezi', '+905551234567');
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Hilton Hurghada Resort', 2, 'Хургада', 5, 'HB', 4.5, 'Sahl Hasheesh', '+201234567890');
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Best Western Hotel Roma', 3, 'Рим', 4, 'BB', 4.2, 'Via Nazionale 123', '+390612345678');
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Phi Phi Island Village', 4, 'Краби', 4, 'FB', 4.9, 'Phi Phi Islands', '+66897654321');
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Grecotel Grand Hotel', 5, 'Крит', 5, 'HB', 4.7, 'Hersonissos', '+302810123456');
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Burj Al Arab', 6, 'Дубай', 5, 'AI', 5.0, 'Jumeirah Beach', '+97141234567');
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Voyage Belek', 1, 'Анталья', 5, 'AI', 4.9, 'Belek', '+905557654321');
INSERT INTO Hotel (id, name, country_id, city, stars, food_type, rating, address, contact_phone) VALUES (seq_hotel.NEXTVAL, 'Athens Plaza Hotel', 5, 'Афины', 4, 'BB', 4.3, 'Syntagma Square', '+302101234567');
COMMIT;

-- =====================================================
-- 4. ЗАПОЛНЕНИЕ TourType (Типы туров) - 5 строк
-- =====================================================
INSERT INTO TourType (id, name, description, seasonality, activity_level) VALUES (seq_tourtype.NEXTVAL, 'Пляжный', 'Отдых на море, бассейн, расслабление', 'summer', 'low');
INSERT INTO TourType (id, name, description, seasonality, activity_level) VALUES (seq_tourtype.NEXTVAL, 'Экскурсионный', 'Посещение достопримечательностей, музеи', 'all', 'medium');
INSERT INTO TourType (id, name, description, seasonality, activity_level) VALUES (seq_tourtype.NEXTVAL, 'Экстремальный', 'Дайвинг, треккинг, сафари', 'winter', 'high');
INSERT INTO TourType (id, name, description, seasonality, activity_level) VALUES (seq_tourtype.NEXTVAL, 'Горнолыжный', 'Катание на лыжах, сноуборд', 'winter', 'high');
INSERT INTO TourType (id, name, description, seasonality, activity_level) VALUES (seq_tourtype.NEXTVAL, 'Лечебный', 'Санатории, оздоровление, спа', 'all', 'low');
COMMIT;

-- =====================================================
-- 5. ЗАПОЛНЕНИЕ Flight (Рейсы) - 6 строк
-- =====================================================
INSERT INTO Flight (id, airline, flight_number, departure_airport, arrival_airport, departure_datetime, arrival_datetime, flight_class, is_included) VALUES (seq_flight.NEXTVAL, 'Turkish Airlines', 'TK123', 'MSQ (Минск)', 'AYT (Анталья)', TO_TIMESTAMP('2024-06-15 10:00', 'YYYY-MM-DD HH24:MI'), TO_TIMESTAMP('2024-06-15 13:30', 'YYYY-MM-DD HH24:MI'), 'economy', 1);
INSERT INTO Flight (id, airline, flight_number, departure_airport, arrival_airport, departure_datetime, arrival_datetime, flight_class, is_included) VALUES (seq_flight.NEXTVAL, 'Egypt Air', 'MS456', 'MSQ (Минск)', 'HRG (Хургада)', TO_TIMESTAMP('2024-06-20 08:30', 'YYYY-MM-DD HH24:MI'), TO_TIMESTAMP('2024-06-20 12:00', 'YYYY-MM-DD HH24:MI'), 'economy', 1);
INSERT INTO Flight (id, airline, flight_number, departure_airport, arrival_airport, departure_datetime, arrival_datetime, flight_class, is_included) VALUES (seq_flight.NEXTVAL, 'Belavia', 'B2789', 'MSQ (Минск)', 'FCO (Рим)', TO_TIMESTAMP('2024-07-01 15:45', 'YYYY-MM-DD HH24:MI'), TO_TIMESTAMP('2024-07-01 17:30', 'YYYY-MM-DD HH24:MI'), 'economy', 1);
INSERT INTO Flight (id, airline, flight_number, departure_airport, arrival_airport, departure_datetime, arrival_datetime, flight_class, is_included) VALUES (seq_flight.NEXTVAL, 'Qatar Airways', 'QR1234', 'MSQ (Минск)', 'DOH (Доха)', TO_TIMESTAMP('2024-07-10 11:20', 'YYYY-MM-DD HH24:MI'), TO_TIMESTAMP('2024-07-10 18:45', 'YYYY-MM-DD HH24:MI'), 'business', 0);
INSERT INTO Flight (id, airline, flight_number, departure_airport, arrival_airport, departure_datetime, arrival_datetime, flight_class, is_included) VALUES (seq_flight.NEXTVAL, 'Emirates', 'EK789', 'DXB (Дубай)', 'BKK (Бангкок)', TO_TIMESTAMP('2024-07-15 09:30', 'YYYY-MM-DD HH24:MI'), TO_TIMESTAMP('2024-07-15 18:30', 'YYYY-MM-DD HH24:MI'), 'economy', 0);
INSERT INTO Flight (id, airline, flight_number, departure_airport, arrival_airport, departure_datetime, arrival_datetime, flight_class, is_included) VALUES (seq_flight.NEXTVAL, 'Aegean Airlines', 'A3456', 'MSQ (Минск)', 'ATH (Афины)', TO_TIMESTAMP('2024-08-01 13:15', 'YYYY-MM-DD HH24:MI'), TO_TIMESTAMP('2024-08-01 15:30', 'YYYY-MM-DD HH24:MI'), 'economy', 1);
COMMIT;

-- =====================================================
-- 6. ЗАПОЛНЕНИЕ "User" (Пользователи) - 8 строк
-- =====================================================
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'ivan.ivanov@mail.com', 'hash_ivan123', 'Иван', 'Иванов', '+375291234567', TIMESTAMP '2023-01-10 00:00:00', TIMESTAMP '2024-05-20 10:30:00', 'client');
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'maria.petrova@mail.com', 'hash_maria456', 'Мария', 'Петрова', '+375297654321', TIMESTAMP '2023-02-15 00:00:00', TIMESTAMP '2024-05-21 15:45:00', 'client');
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'petr.sidorov@mail.com', 'hash_petr789', 'Петр', 'Сидоров', '+375331122334', TIMESTAMP '2024-03-20 00:00:00', TIMESTAMP '2024-05-19 09:15:00', 'client');
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'anna.smirnova@travel.com', 'hash_anna001', 'Анна', 'Смирнова', '+375291112233', TIMESTAMP '2022-01-15 00:00:00', TIMESTAMP '2024-05-22 08:00:00', 'manager');
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'sergey.kozlov@travel.com', 'hash_sergey002', 'Сергей', 'Козлов', '+375293334455', TIMESTAMP '2022-03-20 00:00:00', TIMESTAMP '2024-05-21 16:20:00', 'manager');
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'elena.kovaleva@mail.com', 'hash_elena111', 'Елена', 'Ковалева', '+375336667788', TIMESTAMP '2023-11-05 00:00:00', TIMESTAMP '2024-05-18 14:10:00', 'client');
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'dmitry.novik@mail.com', 'hash_dmitry222', 'Дмитрий', 'Новик', '+375299998877', TIMESTAMP '2024-01-25 00:00:00', TIMESTAMP '2024-05-17 11:30:00', 'client');
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role) VALUES (seq_user.NEXTVAL, 'olga.zayceva@mail.com', 'hash_olga333', 'Ольга', 'Зайцева', '+375253334455', TIMESTAMP '2023-09-12 00:00:00', TIMESTAMP '2024-05-20 18:50:00', 'client');
COMMIT;

-- =====================================================
-- 7. ЗАПОЛНЕНИЕ Client (Клиенты) - 5 строк
-- =====================================================
INSERT INTO Client (user_id, passport_number, passport_issue_date, passport_expiry_date, date_of_birth, loyalty_points, client_since) VALUES (1, 'MP1234567', DATE '2020-05-15', DATE '2030-05-15', DATE '1990-03-12', 150, DATE '2023-01-15');
INSERT INTO Client (user_id, passport_number, passport_issue_date, passport_expiry_date, date_of_birth, loyalty_points, client_since) VALUES (2, 'MP7654321', DATE '2021-08-20', DATE '2031-08-20', DATE '1985-07-25', 75, DATE '2023-02-20');
INSERT INTO Client (user_id, passport_number, passport_issue_date, passport_expiry_date, date_of_birth, loyalty_points, client_since) VALUES (3, 'MP3344556', DATE '2022-01-10', DATE '2032-01-10', DATE '1995-11-02', 0, DATE '2024-03-25');
INSERT INTO Client (user_id, passport_number, passport_issue_date, passport_expiry_date, date_of_birth, loyalty_points, client_since) VALUES (6, 'MP9988776', DATE '2020-11-15', DATE '2030-11-15', DATE '1992-04-18', 220, DATE '2023-11-10');
INSERT INTO Client (user_id, passport_number, passport_issue_date, passport_expiry_date, date_of_birth, loyalty_points, client_since) VALUES (7, 'MP5566778', DATE '2021-03-22', DATE '2031-03-22', DATE '1988-09-30', 50, DATE '2024-01-28');
COMMIT;

-- =====================================================
-- 8. ЗАПОЛНЕНИЕ Manager (Менеджеры) - 2 строки
-- =====================================================
INSERT INTO Manager (user_id, employee_id, hire_date, department, commission_rate) VALUES (4, 'EMP001', DATE '2022-01-15', 'Sales (Продажи)', 5.0);
INSERT INTO Manager (user_id, employee_id, hire_date, department, commission_rate) VALUES (5, 'EMP002', DATE '2022-03-20', 'Customer Support', 3.5);
COMMIT;

-- =====================================================
-- 9. ЗАПОЛНЕНИЕ Tour (Туры) - 6 строк
-- =====================================================
INSERT INTO Tour (id, title, description, tour_type_id, country_id, hotel_id, flight_id, duration_days, departure_date, base_price, available_seats, is_active, created_at) VALUES (seq_tour.NEXTVAL, 'Сказочная Анталья', 'Отличный отдых в Турции с семьей', 1, 1, 1, 1, 7, DATE '2024-06-16', 1200.00, 10, 1, TIMESTAMP '2024-01-15 00:00:00');
INSERT INTO Tour (id, title, description, tour_type_id, country_id, hotel_id, flight_id, duration_days, departure_date, base_price, available_seats, is_active, created_at) VALUES (seq_tour.NEXTVAL, 'Египетские каникулы', 'Отдых в Хургаде, дайвинг', 1, 2, 2, 2, 10, DATE '2024-06-21', 1500.00, 5, 1, TIMESTAMP '2024-01-20 00:00:00');
INSERT INTO Tour (id, title, description, tour_type_id, country_id, hotel_id, flight_id, duration_days, departure_date, base_price, available_seats, is_active, created_at) VALUES (seq_tour.NEXTVAL, 'Римские каникулы', 'Экскурсии по Риму, Колизей, Ватикан', 2, 3, 3, 3, 5, DATE '2024-07-02', 900.00, 8, 1, TIMESTAMP '2024-02-10 00:00:00');
INSERT INTO Tour (id, title, description, tour_type_id, country_id, hotel_id, flight_id, duration_days, departure_date, base_price, available_seats, is_active, created_at) VALUES (seq_tour.NEXTVAL, 'Райский Пхукет', 'Экзотический отдых в Таиланде', 1, 4, 4, 4, 14, DATE '2024-07-15', 2500.00, 6, 1, TIMESTAMP '2024-02-15 00:00:00');
INSERT INTO Tour (id, title, description, tour_type_id, country_id, hotel_id, flight_id, duration_days, departure_date, base_price, available_seats, is_active, created_at) VALUES (seq_tour.NEXTVAL, 'Горнолыжный Куршевель', 'Элитный горнолыжный отдых', 4, 5, 5, 6, 7, DATE '2024-12-10', 3500.00, 4, 1, TIMESTAMP '2024-03-01 00:00:00');
INSERT INTO Tour (id, title, description, tour_type_id, country_id, hotel_id, flight_id, duration_days, departure_date, base_price, available_seats, is_active, created_at) VALUES (seq_tour.NEXTVAL, 'Дубайский шоппинг', 'Шоппинг тур в ОАЭ', 2, 6, 6, 5, 4, DATE '2024-08-05', 1800.00, 7, 1, TIMESTAMP '2024-03-10 00:00:00');
COMMIT;

-- =====================================================
-- 10. ЗАПОЛНЕНИЕ Booking (Бронирования) - 8 строк
-- =====================================================
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-001', 1, 1, 4, TIMESTAMP '2024-05-10 10:00:00', 2, 2, 2400.00);
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-002', 2, 2, 4, TIMESTAMP '2024-05-12 11:30:00', 3, 1, 1500.00);
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-003', 3, 3, 5, TIMESTAMP '2024-05-15 14:20:00', 1, 2, 1800.00);
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-004', 6, 4, 5, TIMESTAMP '2024-05-16 09:45:00', 2, 3, 7500.00);
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-005', 1, 5, 4, TIMESTAMP '2024-05-18 13:15:00', 4, 2, 7000.00);
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-006', 7, 6, 5, TIMESTAMP '2024-05-19 16:30:00', 5, 1, 1800.00);
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-007', 2, 1, 4, TIMESTAMP '2024-05-20 12:00:00', 2, 2, 2400.00);
INSERT INTO Booking (id, booking_number, client_id, tour_id, manager_id, booking_date, status_id, persons_count, total_price) VALUES (seq_booking.NEXTVAL, 'BK-2024-008', 6, 2, 4, TIMESTAMP '2024-05-21 15:45:00', 3, 2, 3000.00);
COMMIT;

-- =====================================================
-- 11. ЗАПОЛНЕНИЕ Payment (Платежи) - 8 строк
-- =====================================================
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 1, 2400.00, TIMESTAMP '2024-05-10 14:30:00', 'card', 'completed', 'TXN001234567');
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 2, 1500.00, TIMESTAMP '2024-05-12 10:15:00', 'transfer', 'completed', 'TXN001234568');
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 3, 900.00, TIMESTAMP '2024-05-15 16:45:00', 'card', 'pending', 'TXN001234569');
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 4, 5000.00, TIMESTAMP '2024-05-16 09:30:00', 'card', 'completed', 'TXN001234570');
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 4, 2500.00, TIMESTAMP '2024-05-17 11:20:00', 'card', 'completed', 'TXN001234571');
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 5, 7000.00, TIMESTAMP '2024-05-18 12:00:00', 'transfer', 'completed', 'TXN001234572');
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 6, 1800.00, TIMESTAMP '2024-05-19 08:45:00', 'card', 'refunded', 'TXN001234573');
INSERT INTO Payment (id, booking_id, amount, payment_date, payment_method, status, transaction_id) VALUES (seq_payment.NEXTVAL, 8, 3000.00, TIMESTAMP '2024-05-21 15:30:00', 'cash', 'completed', 'TXN001234574');
COMMIT;

-- =====================================================
-- 12. ЗАПОЛНЕНИЕ Review (Отзывы) - 6 строк
-- =====================================================
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 5, 1, 5, 5, 'Отличный тур! Отель супер, все понравилось!', TIMESTAMP '2024-05-25 10:00:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 2, 2, 2, 4, 'Хороший отдых, но еда могла бы быть лучше', TIMESTAMP '2024-05-20 12:30:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 1, 1, 1, 5, 'Прекрасный отель, море рядом, анимация на высоте!', TIMESTAMP '2024-05-18 09:15:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 4, 6, 4, 5, 'Таиланд это сказка! Обязательно вернемся!', TIMESTAMP '2024-05-22 14:20:00', 0);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 7, 2, 1, 4, 'Хороший тур, но рейс задержали', TIMESTAMP '2024-05-23 11:45:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 8, 6, 2, 3, 'Нормально, но ожидала большего от Египта', TIMESTAMP '2024-05-24 16:30:00', 1);
COMMIT;

-- =====================================================
-- ПРОВЕРКА ЗАПОЛНЕНИЯ
-- =====================================================
SELECT 'User' AS TableName, COUNT(*) AS RowCount FROM "User"
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
ORDER BY TableName;
/

-- =====================================================
-- ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА СВЯЗЕЙ
-- =====================================================
-- Проверим, что все внешние ключи работают
SELECT 'Country-Hotel связь:' AS Info, COUNT(*) FROM Hotel h INNER JOIN Country c ON h.country_id = c.id;
SELECT 'TourType-Tour связь:' AS Info, COUNT(*) FROM Tour t INNER JOIN TourType tt ON t.tour_type_id = tt.id;
SELECT 'Hotel-Tour связь:' AS Info, COUNT(*) FROM Tour t INNER JOIN Hotel h ON t.hotel_id = h.id;
SELECT 'Flight-Tour связь:' AS Info, COUNT(*) FROM Tour t INNER JOIN Flight f ON t.flight_id = f.id;
SELECT 'Client-Booking связь:' AS Info, COUNT(*) FROM Booking b INNER JOIN Client c ON b.client_id = c.user_id;
SELECT 'Manager-Booking связь:' AS Info, COUNT(*) FROM Booking b INNER JOIN Manager m ON b.manager_id = m.user_id;
SELECT 'Booking-Payment связь:' AS Info, COUNT(*) FROM Payment p INNER JOIN Booking b ON p.booking_id = b.id;
SELECT 'Booking-Review связь:' AS Info, COUNT(*) FROM Review r INNER JOIN Booking b ON r.booking_id = b.id;
/

COMMIT;









-- Отключим триггер временно
ALTER TRIGGER TRG_UPDATE_HOTEL_RATING DISABLE;
/

-- Вставим все отзывы
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 5, 1, 5, 5, 'Отличный тур! Отель супер, все понравилось!', TIMESTAMP '2024-05-25 10:00:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 2, 2, 2, 4, 'Хороший отдых, но еда могла бы быть лучше', TIMESTAMP '2024-05-20 12:30:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 1, 1, 1, 5, 'Прекрасный отель, море рядом, анимация на высоте!', TIMESTAMP '2024-05-18 09:15:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 4, 6, 4, 5, 'Таиланд это сказка! Обязательно вернемся!', TIMESTAMP '2024-05-22 14:20:00', 0);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 7, 2, 1, 4, 'Хороший тур, но рейс задержали', TIMESTAMP '2024-05-23 11:45:00', 1);
INSERT INTO Review (id, booking_id, client_id, tour_id, rating, review_comment, created_at, is_approved) VALUES (seq_review.NEXTVAL, 8, 6, 2, 3, 'Нормально, но ожидала большего от Египта', TIMESTAMP '2024-05-24 16:30:00', 1);
COMMIT;

-- Включим триггер обратно
ALTER TRIGGER TRG_UPDATE_HOTEL_RATING ENABLE;
/

-- Обновим рейтинги отелей вручную (то, что должен был сделать триггер)
UPDATE Hotel h
SET rating = (
    SELECT AVG(r.rating)
    FROM Review r
    JOIN Booking b ON r.booking_id = b.id
    JOIN Tour t ON b.tour_id = t.id
    WHERE t.hotel_id = h.id AND r.is_approved = 1
)
WHERE EXISTS (
    SELECT 1 FROM Tour t WHERE t.hotel_id = h.id
);
COMMIT;


-- Удалим старый триггер
DROP TRIGGER TRG_UPDATE_HOTEL_RATING;
/

-- Создадим упрощенный триггер
CREATE OR REPLACE TRIGGER TRG_UPDATE_HOTEL_RATING
    AFTER INSERT OR UPDATE ON Review
    FOR EACH ROW
DECLARE
    PRAGMA AUTONOMOUS_TRANSACTION;
    v_hotel_id Hotel.id%TYPE;
BEGIN
    SELECT t.hotel_id INTO v_hotel_id
    FROM Tour t
    INNER JOIN Booking b ON t.id = b.tour_id
    WHERE b.id = :NEW.booking_id;

    UPDATE Hotel h
    SET rating = (
        SELECT AVG(r.rating)
        FROM Review r
        JOIN Booking b ON r.booking_id = b.id
        JOIN Tour t ON b.tour_id = t.id
        WHERE t.hotel_id = v_hotel_id
          AND r.is_approved = 1
    )
    WHERE h.id = v_hotel_id;
    
    COMMIT;
END TRG_UPDATE_HOTEL_RATING;
/

ALTER TRIGGER TRG_UPDATE_HOTEL_RATING ENABLE;
/