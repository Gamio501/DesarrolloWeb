package com.mypes.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "El nombre de usuario es requerido")
    private String username;

    @NotBlank(message = "El correo es requerido")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        message = "El correo no tiene un formato válido"
    )
    private String email;

    // OWASP: minimo 8 caracteres, mayuscula, minuscula, numero y caracter especial.
    @NotBlank(message = "La contraseña es requerida")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,64}$",
        message = "La contraseña debe tener 8-64 caracteres, mayúscula, minúscula, número y carácter especial"
    )
    private String password;

    @NotBlank(message = "El rol es requerido")
    private String rol;

}
