package com.miempresa.gestion_hotelera.controller;

import com.miempresa.gestion_hotelera.dto.JwtResponse;
import com.miempresa.gestion_hotelera.dto.LoginRequest;
import com.miempresa.gestion_hotelera.dto.RegisterRequest;
import com.miempresa.gestion_hotelera.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
}
