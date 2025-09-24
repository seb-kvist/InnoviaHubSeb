using System;
using Backend.DTOs.Users;

namespace Backend.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<DTOUserProfile>> GetAllUsersAsync(DTOUserFilter? filter = null);
    Task<DTOUserProfile?> GetUserByIdAsync(string id);
    Task<DTOUserProfile?> UpdateUserAsync(string id, DTOUpdateUser dto);
    Task<bool> DeleteUserAsync(string id);
}
