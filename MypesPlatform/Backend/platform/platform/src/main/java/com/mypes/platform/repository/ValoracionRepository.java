package com.mypes.platform.repository;

import com.mypes.platform.entity.Valoracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {

    List<Valoracion> findByTienda_TiendaIdOrderByFechaDesc(Long tiendaId);

    @Query("SELECT AVG(v.estrellas) FROM Valoracion v WHERE v.tienda.tiendaId = :tiendaId")
    Double calcularPromedioByTiendaId(@Param("tiendaId") Long tiendaId);

    @Query("SELECT COUNT(v) FROM Valoracion v WHERE v.tienda.tiendaId = :tiendaId")
    Integer contarValoracionesByTiendaId(@Param("tiendaId") Long tiendaId);
}
