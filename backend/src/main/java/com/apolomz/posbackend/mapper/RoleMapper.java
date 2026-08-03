package com.apolomz.posbackend.mapper;

import com.apolomz.posbackend.dto.request.RoleRequest;
import com.apolomz.posbackend.dto.response.RoleResponse;
import com.apolomz.posbackend.model.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    Role toEntity(RoleRequest request);

    RoleResponse toResponse(Role role);
}