package com.mypes.platform.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RolAttributeConverter implements AttributeConverter<Rol, String> {

    @Override
    public String convertToDatabaseColumn(Rol rol) {
        return rol == null ? null : rol.name();
    }

    @Override
    public Rol convertToEntityAttribute(String valorDb) {
        if (valorDb == null || valorDb.isBlank()) {
            return null;
        }
        return Rol.valueOf(valorDb.trim().toUpperCase());
    }
}
