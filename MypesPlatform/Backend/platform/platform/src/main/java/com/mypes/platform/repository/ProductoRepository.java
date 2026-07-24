package com.mypes.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mypes.platform.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {


   @Query("SELECT p FROM Producto p JOIN FETCH p.tienda LEFT JOIN FETCH p.usuario WHERE LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
   List<Producto> buscarPorNombre(@Param("nombre") String nombre);
   
   @Override
   @Query("SELECT p FROM Producto p JOIN FETCH p.tienda LEFT JOIN FETCH p.usuario")
   List<Producto> findAll();

   List<Producto> findByTienda_TiendaId(Long tiendaId);

    @Query("select p.precio from Producto p where p.nombre LIKE %:nombre%")
    Double getPrecioByNombre(@Param("nombre")String nombre);


    

}
