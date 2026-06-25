package com.mypes.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import com.mypes.platform.entity.Tienda;
import com.mypes.platform.entity.Usuario;

@Repository
public interface TiendaRepository extends JpaRepository<Tienda, Long> {

    Optional<Tienda> findByUsuario(Usuario usuario);

    Optional<Tienda> findByUsuario_UsuarioId(Long usuarioId);

}
