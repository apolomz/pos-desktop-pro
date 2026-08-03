package com.apolomz.posbackend.service;

import com.apolomz.posbackend.config.Security.JwtService;
import com.apolomz.posbackend.dto.request.LoginRequest;
import com.apolomz.posbackend.dto.request.RegisterRequest;
import com.apolomz.posbackend.dto.response.LoginResponse;
import com.apolomz.posbackend.model.Role;
import com.apolomz.posbackend.model.User;
import com.apolomz.posbackend.repository.RoleRepository;
import com.apolomz.posbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {

        // 1. Autenticar al usuario
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        // 2. Extraer UserDetails
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 3. Generar el token
        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(token);
    }

    public LoginResponse register(RegisterRequest request) {

        // 1. Validar que el rol exista
        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new RuntimeException("El rol con ID " + request.roleId() + " no existe"));

        // 2. Construir la entidad encriptando la contraseña
        User user = User.builder()
                .fullName(request.fullName())
                .username(request.username())
                .password(passwordEncoder.encode(request.password())) // 🔒 Encriptado BCrypt
                .role(role)
                .build();

        // 3. Guardar en base de datos
        userRepository.save(user);

        // 4. Generar y retornar su token de una vez
        String token = jwtService.generateToken(user);
        return new LoginResponse(token);
    }
}