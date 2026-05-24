LOAD DATA
INFILE 'import_data.csv'
INTO TABLE Booking_Staging
APPEND
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
TRAILING NULLCOLS
(
    booking_number "UPPER(:booking_number)",
    client_id,
    tour_id,
    booking_date DATE "YYYY-MM-DD",
    persons_count "ROUND(:persons_count, 0)",
    total_price "ROUND(:total_price, 1)",
    status_name "UPPER(:status_name)"
)