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
            throw new IllegalArgumentException("El usuario ya existe.");
        }

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado."));

        User user = UserMapper.toEntity(request);
        user.setRole(role);
        user.setPassword(
                passwordEncoder.encode(request.password())
        );

        return UserMapper.toResponse(userRepository.save(user));
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