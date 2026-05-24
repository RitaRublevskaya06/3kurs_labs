CREATE LOGIN margo 
WITH PASSWORD = '123';

-- 2. ѕерейти в нужную базу данных
CREATE DATABASE RMV
USE RMV;

-- 3. —оздать пользовател€ в базе данных, св€занного с логином
CREATE USER margo1 FOR LOGIN margo;

-- 4. Ќазначить роли пользователю
ALTER ROLE db_datareader ADD MEMBER margo1;   -- права только на чтение
ALTER ROLE db_datawriter ADD MEMBER margo1;   -- права на запись
ALTER ROLE db_ddladmin ADD MEMBER margo1;     -- права на создание/изменение/удаление объектов