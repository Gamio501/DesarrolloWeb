package com.mypes.platform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name="tbl_producto")
public class Producto {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long productoId;
    @Column(nullable=false)
    private String nombre;
    @Column(nullable=false)
    private double precio;
    @Column(nullable=false)
    private Integer stock;

    

    @ManyToOne
    @JoinColumn(name="tienda_id")
    private Tienda tienda;

    @ManyToOne
    @JoinColumn(name="usuario_id")
    private Usuario usuario;

}
