package com.mypes.platform.security;

import com.mypes.platform.entity.Usuario;
import com.mypes.platform.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuario no encontrado")
                );

        return new User(
                usuario.getUsername(),
                usuario.getPassword(),
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + usuario.getRol()
                        )
                )
        );
    }
}