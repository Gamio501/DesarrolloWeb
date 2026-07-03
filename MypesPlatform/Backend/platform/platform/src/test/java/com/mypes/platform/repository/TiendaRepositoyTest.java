package com.mypes.platform.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.mypes.platform.entity.Rol;
import com.mypes.platform.entity.Tienda;
import com.mypes.platform.entity.Usuario;

@SpringBootTest
public class TiendaRepositoyTest {

    @Autowired
    TiendaRepository tiendaRepository;
    @Autowired
    UsuarioRepository usuarioRepository;



    @Test
    void saveTienda() {

        Usuario usuario = Usuario.builder()
        .username("Martin")
        .password("Martin123")
        .rol(Rol.ADMIN)
        .build();

        usuarioRepository.save(usuario);

        Tienda tienda = Tienda.builder()
                .nombre("Tienda el pollito")
                .direccion("Tumbes")
                .telefono("92929929")
                .usuario(usuario)
                .build();

        tiendaRepository.save(tienda);

    }
}
