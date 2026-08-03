package com.apolomz.posbackend.service; // Recomendado moverlo a service o config.security

import com.apolomz.posbackend.config.Security.JwtService;
import com.apolomz.posbackend.dto.request.LoginRequest;
import com.apolomz.posbackend.dto.response.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {

        // 1. Autenticar al usuario (lanza BadCredentialsException si falla)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        // 2. Extraer el UserDetails del objeto Authentication devuelto
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 3. Generar el token JWT
        String token = jwtService.generateToken(userDetails);

        // 4. Retornar la respuesta
        return new LoginResponse(token);
    }
}