using System;
using Backend.Models;
using Backend.DTOs.Users;
using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly UserManager<User> _userManager;

    public UserRepository(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    //Hämta alla användare(med filter im önskat)
    public async Task<IEnumerable<DTOUserProfile>> GetAllUsersAsync(DTOUserFilter? filter = null)
    {
        var users = _userManager.Users.AsQueryable();

        if (!string.IsNullOrEmpty(filter?.Email))
            users = users.Where(u => u.Email.Contains(filter.Email));

        if (!string.IsNullOrEmpty(filter?.Name))
            users = users.Where(u => u.UserName.Contains(filter.Name));

        return await users
            .Select(u => new DTOUserProfile
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.UserName,
                CreatedAt = DateTime.UtcNow
            })
            .ToListAsync();
    }

    //Hämta användare med ID
    public async Task<DTOUserProfile?> GetUserByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        return new DTOUserProfile
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.UserName,
            CreatedAt = DateTime.UtcNow
        };
    }

    //Uppdatera en användare
    public async Task<DTOUserProfile?> UpdateUserAsync(string id, DTOUpdateUser dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        //Uppdatera endast om de är ny data
        if (!string.IsNullOrEmpty(dto.Email))
            user.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.Name))
            user.UserName = dto.Name;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return null;

        return new DTOUserProfile
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.UserName,
            CreatedAt = DateTime.UtcNow
        };
    }

    //Ta bort användare
    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded;
    }
}
