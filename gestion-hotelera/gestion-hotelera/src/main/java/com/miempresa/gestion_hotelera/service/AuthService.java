package com.miempresa.gestion_hotelera.service;

import com.miempresa.gestion_hotelera.dto.JwtResponse;
import com.miempresa.gestion_hotelera.dto.LoginRequest;
import com.miempresa.gestion_hotelera.dto.RegisterRequest;
import com.miempresa.gestion_hotelera.entity.Rol;
import com.miempresa.gestion_hotelera.entity.Usuario;
import com.miempresa.gestion_hotelera.repository.RolRepository;
import com.miempresa.gestion_hotelera.repository.UsuarioRepository;
import com.miempresa.gestion_hotelera.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public JwtResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsuario(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(token, userDetails.getUsername(), roles);
    }

    public JwtResponse register(RegisterRequest request) {

        if (usuarioRepository.existsByUsuario(request.getUsuario())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario ya existe");
        }

        Rol rolBase = rolRepository.findByNombre("RECEPCION")
                .orElseThrow(() -> new RuntimeException("Rol RECEPCION no encontrado"));

        Usuario usuario = Usuario.builder()
                .usuario(request.getUsuario())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .activo(true)
                .roles(Set.of(rolBase))
                .build();

        usuarioRepository.save(usuario);

        // Autologin tras registrarse
        LoginRequest login = new LoginRequest();
        login.setUsuario(request.getUsuario());
        login.setPassword(request.getPassword());

        return login(login);
    }
}
