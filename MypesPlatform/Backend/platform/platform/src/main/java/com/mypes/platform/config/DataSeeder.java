package com.mypes.platform.config;

import com.mypes.platform.entity.Producto;
import com.mypes.platform.entity.Rol;
import com.mypes.platform.entity.Tienda;
import com.mypes.platform.entity.Usuario;
import com.mypes.platform.repository.ProductoRepository;
import com.mypes.platform.repository.TiendaRepository;
import com.mypes.platform.repository.UsuarioRepository;
import com.mypes.platform.service.WikimediaImageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/**
 * DataSeeder: Inserta datos iniciales en la base de datos al arrancar la
 * aplicacion.
 * Solo ejecuta la insercion si la tabla de usuarios esta vacia (evita
 * duplicados).
 */
@Configuration
public class DataSeeder {

        @Bean
        CommandLineRunner seedDatabase(
                        UsuarioRepository usuarioRepository,
                        TiendaRepository tiendaRepository,
                        ProductoRepository productoRepository,
                        PasswordEncoder passwordEncoder,
                        WikimediaImageService wikimediaImageService) {
                return args -> {
                        // Evitar duplicados: si ya hay usuarios, no insertar nada
                        if (usuarioRepository.count() > 0) {
                                System.out.println(
                                                "[DataSeeder] La base de datos ya contiene datos. Se omite el seeding.");
                                return;
                        }

                        System.out.println("[DataSeeder] Insertando datos iniciales...");

                        // ── USUARIOS ADMIN ──────────────────────────────────────────────────────────
                        Usuario admin1 = Usuario.builder()
                                        .username("admin1")
                                        .email("admin1@mypes.test")
                                        .password(passwordEncoder.encode("admin123"))
                                        .rol(Rol.ADMIN)
                                        .build();

                        Usuario admin2 = Usuario.builder()
                                        .username("admin2")
                                        .email("admin2@mypes.test")
                                        .password(passwordEncoder.encode("admin456"))
                                        .rol(Rol.ADMIN)
                                        .build();

                        // ── USUARIOS CLIENTE ────────────────────────────────────────────────────────
                        Usuario cliente1 = Usuario.builder()
                                        .username("cliente1")
                                        .email("cliente1@mypes.test")
                                        .password(passwordEncoder.encode("cliente123"))
                                        .rol(Rol.CLIENTE)
                                        .build();

                        Usuario cliente2 = Usuario.builder()
                                        .username("cliente2")
                                        .email("cliente2@mypes.test")
                                        .password(passwordEncoder.encode("cliente456"))
                                        .rol(Rol.CLIENTE)
                                        .build();

                        List<Usuario> usuarios = usuarioRepository.saveAll(
                                        List.of(admin1, admin2, cliente1, cliente2));

                        // Recuperar con IDs generados
                        admin1 = usuarios.get(0);
                        admin2 = usuarios.get(1);

                        System.out.println("[DataSeeder] Usuarios insertados: " + usuarios.size());

                        // ── TIENDAS (coordenadas en Sullana, Piura, Peru) ───────────────────────────
                        // La foto se busca en Wikimedia Commons por nombre; si falla (sin red al
                        // arrancar, sin resultados, etc.) queda null y el admin la asigna después
                        // desde "Mi Tienda" — no hay URLs hardcodeadas.
                        Tienda tienda1 = Tienda.builder()
                                        .nombre("Tienda Don Carlos")
                                        .direccion("Jr. Lima 123, Sullana")
                                        .telefono("073-123456")
                                        .latitud(-4.8888)
                                        .longitud(-80.6869)
                                        .imagenUrl(wikimediaImageService.buscarFotoTienda("Tienda Don Carlos"))
                                        .usuario(admin1)
                                        .build();

                        Tienda tienda2 = Tienda.builder()
                                        .nombre("Bazar El Sol")
                                        .direccion("Av. Buenos Aires 456, Sullana")
                                        .telefono("073-654321")
                                        .latitud(-4.8910)
                                        .longitud(-80.6845)
                                        .imagenUrl(wikimediaImageService.buscarFotoTienda("Bazar El Sol"))
                                        .usuario(admin2)
                                        .build();

                        tienda1 = tiendaRepository.save(tienda1);
                        tienda2 = tiendaRepository.save(tienda2);

                        System.out.println("[DataSeeder] Tiendas insertadas: 2");

                        // ── PRODUCTOS (3 por tienda) ─────────────────────────────────────────────────

                        // Productos de Tienda 1 (admin1)
                        Producto p1 = Producto.builder()
                                        .nombre("Arroz Extra")
                                        .precio(3.50)
                                        .stock(200)
                                        .imagenUrl(wikimediaImageService.buscarFotoProducto("Arroz"))
                                        .tienda(tienda1)
                                        .usuario(admin1)
                                        .build();

                        Producto p2 = Producto.builder()
                                        .nombre("Aceite Vegetal 1L")
                                        .precio(8.90)
                                        .stock(150)
                                        .imagenUrl(wikimediaImageService.buscarFotoProducto("Aceite vegetal"))
                                        .tienda(tienda1)
                                        .usuario(admin1)
                                        .build();

                        Producto p3 = Producto.builder()
                                        .nombre("Azucar Rubia 1kg")
                                        .precio(4.20)
                                        .stock(180)
                                        .imagenUrl(wikimediaImageService.buscarFotoProducto("Azucar rubia"))
                                        .tienda(tienda1)
                                        .usuario(admin1)
                                        .build();

                        // Productos de Tienda 2 (admin2)
                        Producto p4 = Producto.builder()
                                        .nombre("Chocolates Nestlé")
                                        .precio(5.00)
                                        .stock(60)
                                        .imagenUrl(wikimediaImageService.buscarFotoProducto("Chocolate"))
                                        .tienda(tienda2)
                                        .usuario(admin2)
                                        .build();

                        Producto p5 = Producto.builder()
                                        .nombre("Huevos")
                                        .precio(12.00)
                                        .stock(80)
                                        .imagenUrl(wikimediaImageService.buscarFotoProducto("Huevos"))
                                        .tienda(tienda2)
                                        .usuario(admin2)
                                        .build();

                        Producto p6 = Producto.builder()
                                        .nombre("Galletas")
                                        .precio(1.50)
                                        .stock(300)
                                        .imagenUrl(wikimediaImageService.buscarFotoProducto("Galletas"))
                                        .tienda(tienda2)
                                        .usuario(admin2)
                                        .build();

                        productoRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));

                        System.out.println("[DataSeeder] Productos insertados: 6");
                        System.out.println("[DataSeeder] Seeding completado exitosamente.");
                };
        }
}
