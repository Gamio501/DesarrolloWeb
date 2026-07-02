package com.mypes.platform.service;

import java.util.List;

import com.mypes.platform.dto.ProductoDTO;

public interface ProductoService {


    ProductoDTO save(ProductoDTO dto);

    List<ProductoDTO> findAll();

    List<ProductoDTO> findByTiendaId(Long tiendaId);

    List<ProductoDTO> findMisProductos();

    ProductoDTO findById(Long id);

    void delete(Long id);

    ProductoDTO update(ProductoDTO dto);

    


}
