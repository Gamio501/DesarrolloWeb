package com.mypes.platform.service;

import com.mypes.platform.dto.UsuarioDTO;

public interface UsuarioService {


    UsuarioDTO save(UsuarioDTO dto);
    UsuarioDTO findById(Long id);
    UsuarioDTO update(UsuarioDTO dto);
    

}
