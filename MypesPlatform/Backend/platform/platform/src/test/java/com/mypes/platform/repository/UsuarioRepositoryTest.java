package com.mypes.platform.repository;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.mypes.platform.entity.Rol;
import com.mypes.platform.entity.Usuario;

@SpringBootTest
public class UsuarioRepositoryTest {

    @Autowired
    UsuarioRepository usuarioRepository;

    @Test
    public void saveUsuario() {
        Usuario usuario = Usuario.builder()
                .username("estefano")
                .password("4321")
                .rol(Rol.ADMIN)
                .build();
        usuarioRepository.save(usuario);
    }

    @Test
    public void findUserById() {
        Usuario usuario = usuarioRepository.findById(5L).get();
        System.out.println("usuario" + usuario);
    }

    @Test
    public void deleteUserById() {
        
            usuarioRepository.deleteById(12L);
            System.out.println("usuario eliminado");
      
    }

    @Test
    public void findAllUsers(){
        List<Usuario> usuarioList = usuarioRepository.findAll();
        System.out.println("Usuarios"+usuarioList);
    }

    @Test
    public void findByUsername(){
        Usuario usuario = usuarioRepository.findByUsername("ian").get();

        System.out.println("usuario"+usuario);

    }

    @Test
    public void getUsernameById(){
        String username = usuarioRepository.getUsernamebyId(1L);
        System.out.println("NOMBRE DE USUARIO "+username);
    }

}
