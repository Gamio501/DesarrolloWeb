package com.mypes.platform.repository;

import com.mypes.platform.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);
    @Query("SELECT u.username FROM Usuario u WHERE u.id = :id")
    String getUsernamebyId(Long id);


}