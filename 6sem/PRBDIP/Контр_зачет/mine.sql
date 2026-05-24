INSERT INTO ticker VALUES('DEMO', '01-05-23', 100);  -- начальная цена
INSERT INTO ticker VALUES('DEMO', '02-05-23', 94);   -- резкий спуск (A: -6%)
INSERT INTO ticker VALUES('DEMO', '03-05-23', 97);   -- отскок (B: +3%)
INSERT INTO ticker VALUES('DEMO', '04-05-23', 85);   -- глубокое падение (C: -12%)
INSERT INTO ticker VALUES('DEMO', '05-05-23', 92);   -- подъем (D: +8%)
INSERT INTO ticker VALUES('DEMO', '06-05-23', 90);   -- небольшой спад (E: -2%)
INSERT INTO ticker VALUES('DEMO', '07-05-23', 98);   -- финальный взлет (F: +9%)

COMMIT;

DELETE FROM ticker WHERE symbol = 'DEMO';
COMMIT;

---1 демо
SELECT 
    symbol,
    tstamp,
    price,
    step,
    match_id
FROM ticker
MATCH_RECOGNIZE (
    PARTITION BY symbol
    ORDER BY tstamp
    
    MEASURES
        MATCH_NUMBER() AS match_id,
        CLASSIFIER() AS step
    
    ALL ROWS PER MATCH
    AFTER MATCH SKIP TO NEXT ROW
    
    PATTERN (A B C D E F)
    
    DEFINE
        A AS price < PREV(price) * 0.95,
        B AS price > PREV(price) * 1.02,
        C AS price < PREV(price) * 0.90,
        D AS price > PREV(price) * 1.05,
        E AS price < PREV(price) * 0.98,
        F AS price > PREV(price) * 1.07
);


SELECT 
    symbol,
    tstamp,
    price,
    LAG(price) OVER (PARTITION BY symbol ORDER BY tstamp) as prev_price,
    ROUND((price / LAG(price) OVER (PARTITION BY symbol ORDER BY tstamp) - 1) * 100, 2) as percent_change
FROM ticker
ORDER BY symbol, tstamp;

SELECT symbol, tstamp, price, step, match_id
FROM ticker
MATCH_RECOGNIZE (
    PARTITION BY symbol
    ORDER BY tstamp
    MEASURES MATCH_NUMBER() AS match_id, CLASSIFIER() AS step
    ALL ROWS PER MATCH
    PATTERN (A B C D E F)
    DEFINE
        A AS price < PREV(price) * 0.95,   -- резкий спуск (-5%)
        B AS price > PREV(price) * 1.02,   -- отскок (+2%)
        C AS price < PREV(price) * 0.90,   -- глубокое падение (-10%)
        D AS price > PREV(price) * 1.05,   -- подъем (+5%)
        E AS price < PREV(price) * 0.98,   -- спад (-2%)
        F AS price > PREV(price) * 1.07    -- взлет (+7%)
);

















WITH price_changes AS (
    SELECT 
        symbol,
        tstamp,
        price,
        LAG(price, 1) OVER (PARTITION BY symbol ORDER BY tstamp) as p1,
        LAG(price, 2) OVER (PARTITION BY symbol ORDER BY tstamp) as p2,
        LAG(price, 3) OVER (PARTITION BY symbol ORDER BY tstamp) as p3,
        LAG(price, 4) OVER (PARTITION BY symbol ORDER BY tstamp) as p4,
        LAG(price, 5) OVER (PARTITION BY symbol ORDER BY tstamp) as p5,
        LAG(price, 6) OVER (PARTITION BY symbol ORDER BY tstamp) as p6,
        ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY tstamp) as rn
    FROM ticker
)
SELECT 
    symbol,
    p6 as step1_price,
    p5 as step2_price,
    p4 as step3_price,
    p3 as step4_price,
    p2 as step5_price,
    p1 as step6_price,
    price as step7_price,
    ROUND((p5 / p6 - 1) * 100, 2) as change1,
    ROUND((p4 / p5 - 1) * 100, 2) as change2,
    ROUND((p3 / p4 - 1) * 100, 2) as change3,
    ROUND((p2 / p3 - 1) * 100, 2) as change4,
    ROUND((p1 / p2 - 1) * 100, 2) as change5,
    ROUND((price / p1 - 1) * 100, 2) as change6
FROM price_changes
WHERE p6 IS NOT NULL
ORDER BY symbol, rn;




----2 
SELECT 
    symbol,
    tstamp,
    price,
    step,
    match_id
FROM ticker
MATCH_RECOGNIZE (
    PARTITION BY symbol
    ORDER BY tstamp
    
    MEASURES
        MATCH_NUMBER() AS match_id,
        CLASSIFIER() AS step
    
    ALL ROWS PER MATCH
    AFTER MATCH SKIP TO NEXT ROW
    
    PATTERN (A B C D E F)
    
    DEFINE
        A AS price < PREV(price) * 0.86,   -- падение на 14%+
        B AS price < PREV(price) * 0.95,   -- падение на 5%+
        C AS price < PREV(price) * 0.95,   -- падение на 5%+
        D AS price > PREV(price) * 1.17,   -- рост на 17%+
        E AS price < PREV(price) * 0.85,   -- падение на 15%+
        F AS price > PREV(price) * 1.17    -- рост на 17%+
);

---- 2,1
SELECT 
    symbol,
    tstamp,
    price,
    step,
    match_id
FROM ticker
MATCH_RECOGNIZE (
    PARTITION BY symbol
    ORDER BY tstamp
    
    MEASURES
        MATCH_NUMBER() AS match_id,
        CLASSIFIER() AS step
    
    ALL ROWS PER MATCH
    AFTER MATCH SKIP TO NEXT ROW
    
    PATTERN (up1 up2 up3 down1 up4 down2)
    
    DEFINE
        up1   AS price > PREV(price) * 1.10,   -- рост на 10%+
        up2   AS price > PREV(price) * 1.10,   -- рост на 10%+
        up3   AS price > PREV(price) * 1.10,   -- рост на 10%+
        down1 AS price < PREV(price) * 0.50,   -- падение на 50%+
        up4   AS price > PREV(price) * 1.20,   -- рост на 20%+
        down2 AS price < PREV(price) * 0.85    -- падение на 15%+
);

---- 2,2
SELECT symbol, tstamp, price, step, match_id
FROM ticker
MATCH_RECOGNIZE (
    PARTITION BY symbol
    ORDER BY tstamp
    MEASURES MATCH_NUMBER() AS match_id, CLASSIFIER() AS step
    ALL ROWS PER MATCH
    PATTERN (A B C D E F)
    DEFINE
        A AS price < PREV(price) * 0.90,   -- падение 10%+
        B AS price > PREV(price) * 1.15,   -- рост 15%+
        C AS price < PREV(price) * 0.85,   -- падение 15%+
        D AS price > PREV(price) * 1.10,   -- рост 10%+
        E AS price < PREV(price) * 0.80,   -- падение 20%+
        F AS price > PREV(price) * 1.20    -- рост 20%+
);


