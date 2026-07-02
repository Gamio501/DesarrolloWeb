# Backend Architecture — MypesPlatform

> **Fecha:** 2026-06-30
> **Stack:** Spring Boot 4.0.6 + Java 17 + MySQL + JWT + Thymeleaf

---

## 1. Resumen

Backend monolítico construido con Spring Boot 4.0.6 que expone una API REST para el frontend Angular y también sirve vistas Thymeleaf server-side. Utiliza Spring Security con JWT stateless, Spring Data JPA con Hibernate, y MySQL como base de datos.

---

## 2. Estructura del Proyecto

```
platform/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/mypes/platform/
    │   │   ├── PlatformApplication.java     ← @SpringBootApplication
    │   │   ├── controller/
    │   │   │   ├── AuthController.java       ← /auth
    │   │   │   ├── TiendaController.java     ← /tienda
    │   │   │   ├── ProductoController.java   ← /productos
    │   │   │   ├── RootController.java       ← (raíz, redirección)
    │   │   │   └── viewController.java       ← /vista/** (Thymeleaf)
    │   │   ├── dto/
    │   │   │   ├── AuthResponse.java
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── RegisterRequest.java
    │   │   │   ├── RegisterResponse.java
    │   │   │   ├── UsuarioDTO.java
    │   │   │   ├── TiendaDTO.java
    │   │   │   ├── ProductoDTO.java
    │   │   │   ├── PedidoDTO.java
    │   │   │   └── DetallePedidosDTO.java
    │   │   ├── entity/
    │   │   │   ├── Usuario.java
    │   │   │   ├── Tienda.java
    │   │   │   ├── Producto.java
    │   │   │   ├── Pedido.java
    │   │   │   ├── DetallePedidos.java
    │   │   │   ├── Rol.java                 ← enum: ADMIN, CLIENTE
    │   │   │   ├── Estado.java              ← enum: DISPONIBLE, BAJO, NO_DISPONIBLE
    │   │   │   └── RolAttributeConverter.java
    │   │   ├── repository/
    │   │   │   ├── UsuarioRepository.java
    │   │   │   ├── TiendaRepository.java
    │   │   │   ├── ProductoRepository.java
    │   │   │   └── PedidoRepository.java
    │   │   ├── security/
    │   │   │   ├── SecurityConfig.java          ← Config Spring Security + CORS
    │   │   │   ├── JwtUtil.java                ← Crear/validar JWT
    │   │   │   ├── JwtFilter.java              ← Filtro OncePerRequestFilter
    │   │   │   └── CustomUserDetailsService.java ← UserDetailsService
    │   │   └── service/
    │   │       ├── AuthService.java            ← Auth concreto
    │   │       ├── UsuarioService.java         ← Interfaz (sin impl)
    │   │       ├── TiendaService.java          ← Interfaz
    │   │       ├── ProductoService.java        ← Interfaz
    │   │       ├── PedidoService.java          ← Interfaz (sin impl)
    │   │       └── impl/
    │   │           ├── TiendaServiceImpl.java  ← Implementación
    │   │           └── ProductoServiceImpl.java ← Implementación
    │   └── resources/
    │       ├── application.properties
    │       ├── static/
    │       │   ├── css/styles.css
    │       │   └── js/app.js
    │       └── templates/
    │           ├── home.html
    │           ├── tienda.html
    │           ├── miTienda.html
    │           ├── register.html
    │           ├── formlogin.html
    │           ├── agregarProducto.html
    │           └── fragments/nav.html
    └── test/java/com/mypes/platform/
        ├── PlatformApplicationTests.java
        └── repository/
            ├── UsuarioRepositoryTest.java
            ├── TiendaRepositoyTest.java
            └── ProductoRepositoryTest.java
```

---

## 3. Arquitectura en Capas

```
┌──────────────────────────────────────────────────────────┐
│                    CONTROLLERS                            │
│  @RestController / @Controller                           │
│  Auth | Tienda | Producto | Root | viewController        │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP Request → DTO
┌────────────────────▼─────────────────────────────────────┐
│                    SERVICES                               │
│  Interfaz + Implementación                               │
│  AuthService | TiendaServiceImpl | ProductoServiceImpl   │
│  UsuarioService (†) | PedidoService (†)                  │
└────────────────────┬─────────────────────────────────────┘
                     │ Lógica de negocio
┌────────────────────▼─────────────────────────────────────┐
│                   REPOSITORIES                            │
│  Spring Data JPA                                         │
│  Usuario | Tienda | Producto | Pedido                    │
└────────────────────┬─────────────────────────────────────┘
                     │ JPA/Hibernate
┌────────────────────▼─────────────────────────────────────┐
│                    ENTITIES                               │
│  Usuario | Tienda | Producto | Pedido | DetallePedidos   │
│  Enums: Rol (ADMIN/CLIENTE), Estado                      │
└──────────────────────────────────────────────────────────┘

(†) = Sin implementación concreta
```

---

## 4. Base de Datos

### 4.1 Configuración

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/db_mype
spring.datasource.username=root
spring.datasource.password=0707
spring.jpa.hibernate.ddl-auto=update
server.port=8880
```

- **Motor:** MySQL 8+
- **Base:** `db_mype`
- **DDL:** Automático (Hibernate crea/actualiza tablas)
- **Puerto servidor:** 8880

### 4.2 Esquema y Relaciones

```
┌─────────────┐       ┌──────────────┐
│   Usuario   │1──1   │   Tienda     │
├─────────────┤       ├──────────────┤
│ usuario_id  │       │ tienda_id    │
│ username    │       │ nombre       │
│ password    │       │ direccion     │
│ rol         │       │ telefono     │
│ (ADMIN/     │       │ latitud      │
│  CLIENTE)   │       │ longitud     │
└──────┬──────┘       │ usuario_id FK│
       │              └──────────────┘
       │ 1
       │
       │
       │ *
       ▼
┌──────────────┐       ┌─────────────────┐
│   Producto   │*──1   │     Pedido      │
├──────────────┤       ├─────────────────┤
│ producto_id  │       │ pedido_id       │
│ nombre       │       │ cantidad        │
│ precio       │       │ estado_pedido   │
│ stock        │       │ (DISPONIBLE,    │
│ tienda_id FK │       │  BAJO,          │
│ usuario_id FK│       │  NO_DISPONIBLE) │
└──────┬───────┘       │ usuario_id FK   │
       │               └────────┬────────┘
       │ *                      │ 1
       │                        │
       │                        │ *
       ▼                        ▼
┌──────────────────────────────────────┐
│          DetallePedidos              │
├──────────────────────────────────────┤
│ detallespedidos_id                   │
│ cantidad                             │
│ precio_unitario                      │
│ pedido_id FK                         │
│ producto_id FK                       │
└──────────────────────────────────────┘
```

### 4.3 Entidades

#### Usuario (`tbl_usuarios`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| usuario_id | Long (PK) | Auto |
| username | String | `unique`, `nullable` |
| password | String | BCrypt hashed |
| rol | String (enum) | ADMIN o CLIENTE |

#### Tienda (`tbl_tienda`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| tienda_id | Long (PK) | Auto |
| nombre | String | `unique`, `nullable` |
| direccion | String | `unique`, `nullable` |
| telefono | String | `unique`, `nullable` |
| latitud | Double | Nullable |
| longitud | Double | Nullable |
| usuario_id | Long (FK) | `@OneToOne` → Usuario |

#### Producto (`tbl_producto`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| producto_id | Long (PK) | Auto |
| nombre | String | `nullable` |
| precio | double | |
| stock | Integer | |
| tienda_id | Long (FK) | `@ManyToOne` → Tienda |
| usuario_id | Long (FK) | `@ManyToOne` → Usuario |

#### Pedido (`tbl_pedidos`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| pedido_id | Long (PK) | Auto |
| cantidad | int | |
| estado_pedido | String (enum) | DISPONIBLE, BAJO, NO_DISPONIBLE |
| usuario_id | Long (FK) | `@ManyToOne` → Usuario |

#### DetallePedidos (`tbl_detallespedidos`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| detallespedidos_id | Long (PK) | Auto |
| cantidad | Integer | |
| precio_unitario | Double | |
| pedido_id | Long (FK) | `@ManyToOne` → Pedido |
| producto_id | Long (FK) | `@ManyToOne` → Producto |

---

## 5. API REST — Endpoints Completos

### AuthController (`/auth`)

| Método | Ruta | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/auth/register` | `permitAll` | `RegisterRequest` (username, password, rol) | `RegisterResponse` (mensaje, usuarioId) |
| POST | `/auth/login` | `permitAll` | `LoginRequest` (username, password) | `AuthResponse` (token JWT) |

### TiendaController (`/tienda`)

| Método | Ruta | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/tienda/mi-tienda` | `ADMIN` | - | `TiendaDTO` |
| POST | `/tienda/guardar` | `ADMIN` | `TiendaDTO` | `TiendaDTO` |
| GET | `/tienda/todas` | `permitAll` | - | `TiendaDTO[]` |

### ProductoController (`/productos`)

| Método | Ruta | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/productos/guardar` | `ADMIN` | `ProductoDTO` | `ProductoDTO` |
| GET | `/productos/check-admin` | `authenticated` | - | 200/403 |
| GET | `/productos/mi-tienda` | `ADMIN` | - | `ProductoDTO[]` |
| GET | `/productos/listar` | `permitAll` | - | `ProductoDTO[]` |

### Vistas Thymeleaf (`/vista`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/vista/home` | Home con tiendas y productos |
| GET | `/vista/tienda/{id}` | Detalle de tienda |
| GET | `/vista/agregarProducto` | Formulario producto |
| GET | `/vista/formlogin` | Login |
| GET | `/vista/register` | Registro |
| GET | `/vista/miTienda` | Mi tienda |
| POST | `/vista/login` | Procesa login |

---

## 6. Seguridad

### 6.1 Componentes

```
SecurityConfig.java
├── CORS: http://localhost:4200
├── CSRF: DISABLED
├── Session: STATELESS
├── PasswordEncoder: BCrypt
└── SecurityFilterChain
      ├── permitAll: /auth/**, /vista/**, /css/**, /js/**
      ├── permitAll: GET /productos/listar, GET /tienda/todas
      ├── hasRole("ADMIN"): /tienda/mi-tienda, /tienda/guardar,
      │                     /productos/guardar, /productos/mi-tienda,
      │                     /admin/**
      ├── hasAnyRole("CLIENTE","ADMIN"): /usuario/**
      └── authenticated: todo lo demás

JwtUtil.java
├── Clave: "mypesplataformaseguridadjwt2026proyectofinal" (HS256)
├── Expiración: 100 minutos (6,000,000 ms)
├── generateToken(username)
├── extractUsername(token)
└── validateToken(token, username)

JwtFilter.java (extends OncePerRequestFilter)
├── Skip: /auth/**
├── Extrae: Authorization: Bearer <token>
├── Valida token → SecurityContextHolder
└── Usa: CustomUserDetailsService

CustomUserDetailsService.java
├── Busca usuario por username en BD
└── Retorna User con ROLE_ADMIN o ROLE_CLIENTE
```

### 6.2 Flujo de Autenticación

```
POST /auth/login
  ↓
AuthService.login(LoginRequest)
  ↓
AuthenticationManager.authenticate()
  ↓
CustomUserDetailsService.loadUserByUsername()
  ↓
JwtUtil.generateToken(username)
  ↓
Retorna { token: "eyJhbGciOiJIUzI1NiJ9..." }

← Frontend almacena en localStorage ←
```

### 6.3 Flujo de Autorización (request subsiguiente)

```
GET /tienda/mi-tienda (Authorization: Bearer <token>)
  ↓
JwtFilter.doFilterInternal()
  ↓
Extrae token del header
  ↓
JwtUtil.validateToken(token, username)
  ↓
SecurityContextHolder.getContext().setAuthentication(auth)
  ↓
SecurityConfig verifica hasRole("ADMIN")
  ↓
Ejecuta TiendaController
```

---

## 7. Servicios — Lógica de Negocio

### AuthService (concreto)
| Método | Descripción |
|--------|-------------|
| `register(RegisterRequest)` | Valida username único, codifica BCrypt, asigna rol, guarda usuario |
| `login(LoginRequest)` | Autentica con AuthenticationManager, genera JWT |

### TiendaServiceImpl
| Método | Estado | Descripción |
|--------|--------|-------------|
| `save(TiendaDTO)` | ✅ | Valida campos, asocia al usuario autenticado |
| `findById(Long)` | ✅ | Busca por ID |
| `findAll()` | ✅ | Lista todas (con lat/lng) |
| `findByUsuarioId(Long)` | ✅ | Busca por ID de usuario |
| `findMiTienda()` | ✅ | Obtiene del SecurityContext |
| `update(TiendaDTO)` | ❌ | Lanza `UnsupportedOperationException` |

### ProductoServiceImpl
| Método | Estado | Descripción |
|--------|--------|-------------|
| `save(ProductoDTO)` | ✅ | Valida precio≥0, stock≥0, asocia a tienda del admin |
| `findAll()` | ✅ | Lista todos |
| `findByTiendaId(Long)` | ✅ | Productos de una tienda |
| `findMisProductos()` | ✅ | Productos del admin autenticado |
| `findById(Long)` | ❌ | Lanza `UnsupportedOperationException` |
| `delete(Long)` | ❌ | Lanza `UnsupportedOperationException` |
| `update(ProductoDTO)` | ❌ | Lanza `UnsupportedOperationException` |

### UsuarioService (interfaz sin implementación)
- `save(UsuarioDTO)` — ❌ Sin impl
- `findById(Long)` — ❌ Sin impl
- `update(UsuarioDTO)` — ❌ Sin impl

### PedidoService (interfaz sin implementación)
- `save(PedidoDTO)` — ❌ Sin impl
- `findAll()` — ❌ Sin impl
- `findById(Long)` — ❌ Sin impl
- `updateStade(Long, Estado)` — ❌ Sin impl

---

## 8. DTOs

| DTO | Campos | Uso |
|-----|--------|-----|
| `LoginRequest` | username, password | POST /auth/login |
| `RegisterRequest` | username, password, rol | POST /auth/register |
| `AuthResponse` | token | Respuesta login |
| `RegisterResponse` | mensaje, usuarioId | Respuesta register |
| `UsuarioDTO` | id, username, rol | Sin uso actual |
| `TiendaDTO` | tiendaId, nombre, direccion, telefono, usuarioId, latitud, longitud | CRUD tienda |
| `ProductoDTO` | productoId, nombre, precio, stock, tiendaId, usuarioId | CRUD producto |
| `PedidoDTO` | pedidoId, cantidad, estado, estadoPedido, usuarioId | Sin uso actual |
| `DetallePedidosDTO` | detallespedidosId, cantidad, precioUnitario, pedidoId, productoId | Sin uso actual |

---

## 9. Repositorios

| Repositorio | Métodos personalizados |
|-------------|----------------------|
| `UsuarioRepository` | `findByUsername(String)`, `getUsernamebyId(Long)` (JPQL) |
| `TiendaRepository` | `findByUsuario(Usuario)`, `findByUsuario_UsuarioId(Long)` |
| `ProductoRepository` | `findByNombreContaining(String)`, `findByTienda_TiendaId(Long)`, `getPrecioByNombre(String)` (JPQL) |
| `PedidoRepository` | Solo métodos estándar de JpaRepository |

---

## 10. Vistas Thymeleaf

| Template | Ruta | Descripción |
|----------|------|-------------|
| `home.html` | GET /vista/home | Lista tiendas y productos |
| `tienda.html` | GET /vista/tienda/{id} | Detalle de tienda |
| `miTienda.html` | GET /vista/miTienda | Gestión de tienda propia |
| `register.html` | GET /vista/register | Formulario registro |
| `formlogin.html` | GET /vista/formlogin | Formulario login |
| `agregarProducto.html` | GET /vista/agregarProducto | Formulario producto |
| `fragments/nav.html` | - | Fragmento navbar reutilizable |

---

## 11. Dependencias (pom.xml)

| Dependencia | Versión | Uso |
|------------|---------|-----|
| spring-boot-starter-web | 4.0.6 | REST + Tomcat |
| spring-boot-starter-security | 4.0.6 | Spring Security |
| spring-boot-starter-data-jpa | 4.0.6 | JPA + Hibernate |
| spring-boot-starter-validation | 4.0.6 | Jakarta Validation |
| spring-boot-starter-thymeleaf | 4.0.6 | Templates HTML |
| mysql-connector-j | (runtime) | Conector MySQL |
| jjwt-api / jjwt-impl / jjwt-jackson | 0.11.5 | JWT |
| lombok | - | @Data, @Builder, etc. |
| spring-boot-starter-test | 4.0.6 | JUnit 5 + Mockito |

---

## 12. Tests

| Test | Tipo | Lo que prueba |
|------|------|---------------|
| `PlatformApplicationTests` | Integración | Contexto Spring Boot carga correctamente |
| `UsuarioRepositoryTest` | Integración | CRUD básico de usuarios + queries personalizadas |
| `TiendaRepositoyTest` | Integración | Guardar tienda asociada a usuario |
| `ProductoRepositoryTest` | Integración | CRUD productos + queries por nombre/precio |

> **Nota:** No existen tests unitarios de servicios ni controladores.

---

## 13. Pendientes y Deuda Técnica

1. **UsuarioService** — Implementar la interfaz (actualmente sin impl)
2. **PedidoService** — Implementar CRUD de pedidos + detalle
3. **Update/Delete en ProductoService** — Métodos lanzan `UnsupportedOperationException`
4. **Update en TiendaService** — Ídem
5. **@ControllerAdvice global** — Manejo uniforme de excepciones HTTP
6. **Clave JWT en properties** — Está hardcodeada en el código fuente
7. **Password MySQL en properties** — En texto plano
8. **Anotaciones @Valid** — Validaciones manuales en servicios, no usa Jakarta Validation
9. **Tests de integración de servicios** — Solo existen tests de repositorios
10. **Tests de controladores** — No existen (MockMvc)
11. **Docker Compose** — No hay dockerización para MySQL
12. **Endpoints REST de Pedido** — Entidades existen pero no hay controladores REST
