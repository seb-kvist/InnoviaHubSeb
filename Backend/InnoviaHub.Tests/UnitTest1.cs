using Xunit;
using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace InnoviaHub.Tests;

public class UserTests
{
    [Fact] // Test för REGISTRERING med GILTIGA uppgifter
    public void RegisterUser_WithValidData_ShouldSucceed()
    {
        // Arrange
        var user = new User
        {
            Name = "Test User",
            Email = "test@example.com"
        };

        var passwordHasher = new PasswordHasher<User>();
        var password = "SecurePassword123";
        user.PasswordHash = passwordHasher.HashPassword(user, password);

        // Act
        var isValid = !string.IsNullOrEmpty(user.Name) &&
                    !string.IsNullOrEmpty(user.Email) &&
                    !string.IsNullOrEmpty(user.PasswordHash);

        // Assert
        Assert.True(isValid, "User registration should succeed with valid data.");
    }

    [Fact] // Test för REGISTRERING med SAKNADE uppgifter
    public void RegisterUser_WithMissingData_ShouldFail()
    {
        // Arrange
        var user = new User
        {
            Name = "Test User",
            Email = null, // OM EMAIL SAKNAS
        };

        var passwordHasher = new PasswordHasher<User>();
        var password = "SecurePassword123";
        user.PasswordHash = passwordHasher.HashPassword(user, password);

        // Act
        var isValid = !string.IsNullOrEmpty(user.Name) &&
                    !string.IsNullOrEmpty(user.Email) &&
                    !string.IsNullOrEmpty(user.PasswordHash);

        // Assert
        Assert.False(isValid, "User registration should fail if required fields are missing.");
    }

    [Fact] // Test för INLOGGNING med GILTIGA uppgifter
    public void LoginUser_WithValidCredentials_ShouldSucceed()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com"
        };

        var passwordHasher = new PasswordHasher<User>();
        var password = "SecurePassword123";
        user.PasswordHash = passwordHasher.HashPassword(user, password);

        var inputPassword = "SecurePassword123";

        // Act
        var passwordVerificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, inputPassword);
        var canLogin = passwordVerificationResult == PasswordVerificationResult.Success;

        // Assert
        Assert.True(canLogin, "User login should succeed with valid credentials.");
    }

    [Fact] // Test för INLOGGNING med OGILTIGA uppgifter
    public void LoginUser_WithInvalidCredentials_ShouldFail()
    {
        // Arrange
        var user = new User
        {
            Email = "test@example.com"
        };

        var passwordHasher = new PasswordHasher<User>();
        var password = "SecurePassword123";
        user.PasswordHash = passwordHasher.HashPassword(user, password);

        var inputPassword = "WrongPassword";

        // Act
        var passwordVerificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, inputPassword);
        var canLogin = passwordVerificationResult == PasswordVerificationResult.Success;

        // Assert
        Assert.False(canLogin, "User login should fail with invalid credentials.");
    }
}