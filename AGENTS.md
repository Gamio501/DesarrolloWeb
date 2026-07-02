# MypesPlatform

Plataforma web para la visibilización y gestión de Micro y Pequeñas Empresas (MYPES).

## Stack Tecnológico

### Frontend
- **Framework:** Angular 20 con standalone components
- **Build:** Vite (via @angular/build)
- **Lenguaje:** TypeScript 5.9
- **Mapas:** Leaflet 1.9.4
- **Auth:** JWT con jwt-decode
- **Testing:** Karma + Jasmine
- **Puerto dev:** 4200

### Backend
- **Framework:** Spring Boot 4.0.6
- **Java:** 17
- **DB:** MySQL (`db_mype` en localhost:3306)
- **ORM:** Spring Data JPA + Hibernate (ddl-auto=update)
- **Auth:** Spring Security + JWT (jjwt 0.11.5)
- **Templates:** Thymeleaf (vistas server-side)
- **Build:** Maven (mvnw)
- **Puerto:** 8880

## Estructura del Proyecto

```
DesarrolloWeb-main/
├── AGENTS.md
├── MypesPlatform/
│   ├── Backend/
│   │   └── platform/platform/
│   │       ├── pom.xml
│   │       └── src/main/java/com/mypes/platform/
│   │           ├── PlatformApplication.java
│   │           ├── controller/       (5 controladores)
│   │           ├── service/          (5 servicios, 2 impl)
│   │           ├── entity/           (5 entidades + 2 enums)
│   │           ├── repository/       (4 repositorios)
│   │           ├── dto/              (9 DTOs)
│   │           ├── security/         (4 clases de seguridad)
│   │           └── resources/
│   │               ├── application.properties
│   │               ├── templates/    (7 vistas Thymeleaf)
│   │               └── static/       (CSS, JS)
│   └── Frontend/
│       └── src/app/
│           ├── core/
│           │   ├── services/         (4 servicios)
│           │   ├── models/           (6 interfaces)
│           │   ├── guards/           (auth + admin)
│           │   └── interceptors/     (JWT interceptor)
│           └── componentes/          (8 componentes)
```

## Endpoints API (Frontend -> Backend)

### Auth (`/auth`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | - | Registrar usuario |
| POST | `/auth/login` | - | Login, retorna JWT |

### Tienda (`/tienda`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/tienda/mi-tienda` | ADMIN | Tienda del admin autenticado |
| POST | `/tienda/guardar` | ADMIN | Crear/actualizar tienda |
| GET | `/tienda/todas` | - | Todas las tiendas (mapa) |

### Producto (`/productos`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/productos/listar` | - | Todos los productos |
| GET | `/productos/mi-tienda` | ADMIN | Productos de mi tienda |
| POST | `/productos/guardar` | ADMIN | Guardar nuevo producto |

## Entidades (Base de Datos)

```
Usuario (1) ---> (1) Tienda
Usuario (1) ---> (*) Producto
Usuario (1) ---> (*) Pedido
Tienda   (1) ---> (*) Producto
Pedido   (1) ---> (*) DetallePedidos
Producto (1) ---> (*) DetallePedidos
```

## Roles y Seguridad

- **Roles:** ADMIN, CLIENTE
- **JWT:** HS256, expira en 100 min, almacenado en localStorage
- **Rutas públicas:** `/home`, `/login`, `/register`, `/tienda/todas`, `/productos/listar`
- **Rutas ADMIN:** `/mi-tienda`, `/agregar-producto`, `/tienda/guardar`, `/productos/guardar`

## Estado Actual del Frontend

| Componente | Lógica TS | Template HTML | Estilos SCSS | Estado |
|------------|-----------|---------------|--------------|--------|
| Home | ✅ | ⚠️ placeholder | ❌ vacío | Semi-completo |
| Formlogin | ✅ | ⚠️ placeholder | ❌ vacío | Semi-completo |
| Register | ✅ | ⚠️ placeholder | ❌ vacío | Semi-completo |
| Navbar | ✅ | ⚠️ placeholder | ❌ vacío | No integrado en layout |
| MiTienda | ✅ | ⚠️ placeholder | ❌ vacío | Semi-completo |
| AgregarProducto | ✅ | ⚠️ placeholder | ❌ vacío | Semi-completo |
| Tienda | ❌ | ⚠️ placeholder | ❌ vacío | Placeholder |
| Mapa | ❌ falta .ts | ✅ escrito | ❌ falta .scss | Incompleto |

## Estado Actual del Backend

| Feature | Estado |
|---------|--------|
| Auth (register/login) | ✅ Completo |
| CRUD Tienda | ✅ Parcial (sin update) |
| CRUD Producto | ✅ Parcial (sin update/delete) |
| CRUD Pedido | ❌ Solo interfaz, sin implementación |
| Vistas Thymeleaf | ✅ 7 vistas funcionales |
| Tests | ⚠️ Solo repository tests |

## Convenciones de Código

- **Frontend:** Angular standalone components, lazy loading, formularios reactivos, servicios con `providedIn: 'root'`
- **Backend:** MVC con capas Controller → Service → Repository → Entity, DTOs para transferencia, Lombok

## Comandos Útiles

```bash
# Frontend
cd MypesPlatform/Frontend
npm start            # ng serve en :4200
npm test             # ng test (Karma)

# Backend
cd MypesPlatform/Backend/platform/platform
./mvnw spring-boot:run
./mvnw test
```

## Notas Importantes

- La API_URL del frontend está hardcodeada como `http://localhost:8880` en cada servicio
- La clave JWT está hardcodeada en `JwtUtil.java`
- La contraseña MySQL está en texto plano en `application.properties`
- No hay manejo global de errores HTTP en el frontend
- No hay librería de UI (Angular Material, Bootstrap, etc.) — los estilos son CSS manual
- El componente Mapa (Leaflet) está a medio construir
