package com.apolomz.posbackend.service;

import com.apolomz.posbackend.dto.request.RoleRequest;
import com.apolomz.posbackend.dto.response.RoleResponse;
import com.apolomz.posbackend.mapper.RoleMapper;
import com.apolomz.posbackend.model.Role;
import com.apolomz.posbackend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleResponse create(RoleRequest request) {

        if (roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("El rol ya existe");
        }

        Role role = roleMapper.toEntity(request);

        Role savedRole = roleRepository.save(role);

        role.setCreatedAt(LocalDateTime.now());
        role.setUpdatedAt(LocalDateTime.now());

        return roleMapper.toResponse(savedRole);
    }

    public List<RoleResponse> findAll() {

        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    public RoleResponse findById(Long id) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado."));

        return roleMapper.toResponse(role);
    }

    public RoleResponse update(Long id, RoleRequest request) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado."));

        if (!role.getName().equals(request.getName())
                && roleRepository.existsByName(request.getName())) {

            throw new RuntimeException("Ya existe un rol con ese nombre.");
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());

        Role updatedRole = roleRepository.save(role);

        role.setUpdatedAt(LocalDateTime.now());

        return roleMapper.toResponse(updatedRole);
    }

    public void delete(Long id) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado."));

        roleRepository.delete(role);
    }
}