using NUnit.Framework;
using System.Text.RegularExpressions;

namespace MedicalCenter.Tests
{
    [TestFixture]
    public class RegistrationValidationTests
    {
        // Тест 1: Проверка валидного email
        [Test]
        public void EmailValidator_ValidEmail_ReturnsTrue()
        {
            // Arrange
            string email = "user@example.com";
            var regex = new Regex(@"(^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$)");

            // Act
            bool result = regex.IsMatch(email);

            // Assert
            Assert.IsTrue(result);
        }

        // Тест 2: Проверка невалидного email
        [Test]
        public void EmailValidator_InvalidEmail_ReturnsFalse()
        {
            // Arrange
            string email = "userexample.com";
            var regex = new Regex(@"(^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$)");

            // Act
            bool result = regex.IsMatch(email);

            // Assert
            Assert.IsFalse(result);
        }

        // Тест 3: Проверка имени на кириллице
        [Test]
        public void NameValidator_CyrillicName_ReturnsTrue()
        {
            // Arrange
            string name = "Маргарита";
            var regex = new Regex(@"^[А-ЯЁ][а-яё]+$");

            // Act
            bool result = regex.IsMatch(name);

            // Assert
            Assert.IsTrue(result);
        }

        // Тест 4: Проверка имени на латинице (должно быть false)
        [Test]
        public void NameValidator_LatinName_ReturnsFalse()
        {
            // Arrange
            string name = "Margarita";
            var regex = new Regex(@"^[А-ЯЁ][а-яё]+$");

            // Act
            bool result = regex.IsMatch(name);

            // Assert
            Assert.IsFalse(result);
        }

        // Тест 5: Проверка имени с цифрами
        [Test]
        public void NameValidator_NameWithNumbers_ReturnsFalse()
        {
            // Arrange
            string name = "Маргарита123";
            var regex = new Regex(@"^[А-ЯЁ][а-яё]+$");

            // Act
            bool result = regex.IsMatch(name);

            // Assert
            Assert.IsFalse(result);
        }

        // Тест 6: Проверка пароля (длина >= 6)
        [Test]
        public void PasswordValidator_LengthMoreThan6_ReturnsTrue()
        {
            // Arrange
            string password = "Secure123";

            // Act
            bool isValid = password.Length >= 6;

            // Assert
            Assert.IsTrue(isValid);
        }

        // Тест 7: Проверка пароля (длина < 6)
        [Test]
        public void PasswordValidator_LengthLessThan6_ReturnsFalse()
        {
            // Arrange
            string password = "123";

            // Act
            bool isValid = password.Length >= 6;

            // Assert
            Assert.IsFalse(isValid);
        }

        // Тест 8: Проверка логина (не пустой)
        [Test]
        public void LoginValidator_NotEmpty_ReturnsTrue()
        {
            // Arrange
            string login = "user123";

            // Act
            bool isValid = !string.IsNullOrWhiteSpace(login);

            // Assert
            Assert.IsTrue(isValid);
        }

        // Тест 9: Проверка логина (пустой)
        [Test]
        public void LoginValidator_Empty_ReturnsFalse()
        {
            // Arrange
            string login = "";

            // Act
            bool isValid = !string.IsNullOrWhiteSpace(login);

            // Assert
            Assert.IsFalse(isValid);
        }

        // Тест 10: Проверка фамилии на кириллице
        [Test]
        public void SurnameValidator_CyrillicSurname_ReturnsTrue()
        {
            // Arrange
            string surname = "Рублевская";
            var regex = new Regex(@"^[А-ЯЁ][а-яё]+$");

            // Act
            bool result = regex.IsMatch(surname);

            // Assert
            Assert.IsTrue(result);
        }
    }
}