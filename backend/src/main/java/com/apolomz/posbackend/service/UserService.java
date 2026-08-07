package com.apolomz.posbackend.service;

import com.apolomz.posbackend.mapper.UserMapper;
import com.apolomz.posbackend.dto.request.UserRequest;
import com.apolomz.posbackend.dto.response.UserResponse;
import com.apolomz.posbackend.exception.ResourceNotFoundException;
import com.apolomz.posbackend.model.Role;
import com.apolomz.posbackend.model.User;
import com.apolomz.posbackend.repository.RoleRepository;
import com.apolomz.posbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper UserMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse create(UserRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("El nombre de usuario '" + request.username() + "' ya está registrado.");
        }

        Role role = resolveRole(request.roleId());

        User user = UserMapper.toEntity(request);
        user.setRole(role);
        user.setIsActive(true);
        user.setPassword(
                passwordEncoder.encode(request.password())
        );

        return UserMapper.toResponse(userRepository.save(user));
    }

    private Role resolveRole(Long roleId) {
        if (roleId != null) {
            var found = roleRepository.findById(roleId);
            if (found.isPresent()) return found.get();
        }

        // Fallback buscando por nombre si el ID no coincidió
        String defaultRoleName = (roleId != null && roleId == 1L) ? "ADMIN" : "CASHIER";
        return roleRepository.findByName(defaultRoleName)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name(defaultRoleName)
                                .description("Rol por defecto " + defaultRoleName)
                                .build()
                ));
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public UserResponse findById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        return UserMapper.toResponse(user);
    }

    public UserResponse update(Long id, UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado."));

        user.setFullName(request.fullName());
        user.setUsername(request.username());
        user.setPassword(
                passwordEncoder.encode(request.password())
        );
        user.setRole(role);

        return UserMapper.toResponse(userRepository.save(user));
    }

    public void delete(Long id) {

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado.");
        }

        userRepository.deleteById(id);
    }

    public UserResponse toggleActiveStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return UserMapper.toResponse(userRepository.save(user));
    }
}