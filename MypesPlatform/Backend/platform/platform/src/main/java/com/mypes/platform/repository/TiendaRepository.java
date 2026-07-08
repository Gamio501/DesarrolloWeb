package com.mypes.platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.mypes.platform.entity.Tienda;
import com.mypes.platform.entity.Usuario;

@Repository
public interface TiendaRepository extends JpaRepository<Tienda, Long> {

    Optional<Tienda> findByUsuario(Usuario usuario);

    Optional<Tienda> findByUsuario_UsuarioId(Long usuarioId);

    @Override
    @Query("SELECT t FROM Tienda t JOIN FETCH t.usuario")
    List<Tienda> findAll();

}
