CREATE DATABASE Celebrities;
GO


USE Celebrities;
GO

CREATE TABLE [dbo].[Celebrities](
    [Id] INT IDENTITY(1,1) NOT NULL,
    [FullName] NVARCHAR(50) NOT NULL,
    [Nationality] NVARCHAR(2) NOT NULL,
    [ReqPhotoPath] NVARCHAR(200) NULL,
    CONSTRAINT [PK_Celebrities] PRIMARY KEY CLUSTERED ([Id] ASC)
);








INSERT INTO Celebrities (FullName, Nationality, ReqPhotoPath)
VALUES 
    ('Albert Einstein', 'DE', '/photos/einstein_updated.jpg'),
    ('Nikola Tesla', 'RS', '/photos/tesla.jpg'),
    ('Ada Lovelace', 'UK', '/photos/lovelace.jpg'),
    ('Dmitri Mendeleev', 'RU', '/photos/mendeleev.jpg'),
    ('Isaac Newton', 'GB', '/photos/newton.jpg');
GO

-- Проверка результата
SELECT * FROM Celebrities;
GO