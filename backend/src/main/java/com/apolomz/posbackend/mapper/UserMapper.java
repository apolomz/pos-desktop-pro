package com.apolomz.posbackend.mapper;

import com.apolomz.posbackend.dto.request.UserRequest;
import com.apolomz.posbackend.dto.response.UserResponse;
import com.apolomz.posbackend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(UserRequest request);

    @Mapping(target = "role", source = "role.name")
    UserResponse toResponse(User user);
}