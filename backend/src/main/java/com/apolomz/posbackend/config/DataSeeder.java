package com.apolomz.posbackend.config;

import com.apolomz.posbackend.model.Role;
import com.apolomz.posbackend.model.User;
import com.apolomz.posbackend.repository.RoleRepository;
import com.apolomz.posbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Guardamos el rol como "ADMIN" (porque tu User.java en getAuthorities() le concatena "ROLE_")
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name("ADMIN")
                                .description("Administrador del sistema")
                                .build()
                ));

        roleRepository.findByName("CASHIER")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name("CASHIER")
                                .description("Cajero del punto de venta")
                                .build()
                ));

        // 2. Crear Usuario Admin si la base de datos no tiene usuarios
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .fullName("Administrador Inicial")
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(adminRole)
                    .build();

            userRepository.save(admin);
            System.out.println("✅ DataSeeder: Usuario 'admin' (password: admin123) creado exitosamente.");
        }
    }
}