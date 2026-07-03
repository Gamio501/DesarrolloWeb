package com.mypes.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mypes.platform.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {


   List <Producto> findByNombreContaining(String nombre);
   
   List <Producto> findAll();

   List<Producto> findByTienda_TiendaId(Long tiendaId);

   @Query("select p.precio from Producto p where p.nombre LIKE %:nombre%")
   double getPrecioByNombre(@Param("nombre")String nombre);


   

}
