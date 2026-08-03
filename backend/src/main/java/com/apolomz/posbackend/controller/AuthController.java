package com.apolomz.posbackend.controller;

import com.apolomz.posbackend.dto.request.LoginRequest;
import com.apolomz.posbackend.dto.response.LoginResponse;
import com.apolomz.posbackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request){

        return authService.login(request);

    }

}