package com.mypes.platform.repository;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.mypes.platform.entity.Producto;

@SpringBootTest
public class ProductoRepositoryTest {

    @Autowired
    ProductoRepository productoRepository;

    @Test
     void saveProduct(){
        Producto producto = Producto.builder()
        .nombre("Pepsi 1.5L")
        .precio(3.50)
        .stock(2)
        .build();
         productoRepository.save(producto);
     }

    @Test
    void testFindAll() {

        List <Producto> listaproductos = productoRepository.findAll();
        System.out.println("Lista de productos"+listaproductos);
    }

    @Test
    void testFindByNombre() {
        List <Producto> productolista = productoRepository.findByNombreContaining("Pepsi");
        System.out.println("producto"+productolista);

    }
    @Test
    void testgetPrecioByNombre(){
        double precio = productoRepository.getPrecioByNombre("chetos");
        System.out.println("Precio"+precio);
    }
}
    