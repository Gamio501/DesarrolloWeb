package com.mypes.platform.security;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Lista de revocacion de tokens JWT en memoria. Permite invalidar un token
 * antes de su expiracion natural (logout real con JWT stateless).
 * Limitada a una sola instancia del backend; para despliegue multi-instancia
 * habria que mover esto a Redis o una tabla compartida.
 */
@Service
public class TokenBlacklistService {

    private final Map<String, Date> revocados = new ConcurrentHashMap<>();

    public void revocar(String jti, Date expiracion) {
        limpiarExpirados();
        revocados.put(jti, expiracion);
    }

    public boolean estaRevocado(String jti) {
        return revocados.containsKey(jti);
    }

    private void limpiarExpirados() {
        Date ahora = new Date();
        revocados.values().removeIf(expiracion -> expiracion.before(ahora));
    }
}
