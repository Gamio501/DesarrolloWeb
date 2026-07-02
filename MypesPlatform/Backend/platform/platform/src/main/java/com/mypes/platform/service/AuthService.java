package com.mypes.platform.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mypes.platform.dto.AuthResponse;
import com.mypes.platform.dto.LoginRequest;
import com.mypes.platform.dto.RegisterRequest;
import com.mypes.platform.dto.RegisterResponse;
import com.mypes.platform.entity.Rol;
import com.mypes.platform.entity.Usuario;
import com.mypes.platform.repository.UsuarioRepository;
import com.mypes.platform.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public RegisterResponse register(RegisterRequest request) {

        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
        }

        Usuario usuario = new Usuario();

        usuario.setUsername(request.getUsername());

        usuario.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        usuario.setRol(Rol.valueOf(request.getRol()));

        Usuario guardado = usuarioRepository.save(usuario);

        return new RegisterResponse(
                "Usuario registrado correctamente",
                guardado.getUsuarioId()
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        String role = usuario.getRol().name();

        String token = jwtUtil.generateToken(
                request.getUsername(),
                role
        );

        return new AuthResponse(token);
    }
}