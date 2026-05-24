CREATE DATABASE Celebrities;
GO


CREATE TABLE [dbo].[Celebrities](
    [Id] INT IDENTITY(1,1) NOT NULL,
    [FullName] NVARCHAR(50) NOT NULL,
    [Nationality] NVARCHAR(2) NOT NULL,
    [ReqPhotoPath] NVARCHAR(200) NULL,
    CONSTRAINT [PK_Celebrities] PRIMARY KEY CLUSTERED ([Id] ASC)
);