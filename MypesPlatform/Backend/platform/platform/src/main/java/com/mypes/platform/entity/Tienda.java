package com.mypes.platform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="tbl_tienda")
public class Tienda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tiendaId ;
    @Column(nullable=false, unique=true)
    private String nombre;
    @Column(nullable=false, unique=true)
    private String direccion;
    @Column(nullable=false, unique=true)
    private String telefono;
    
    @OneToOne
    @JoinColumn(name="usuario_id")
    private Usuario usuario;




    


}
