# MYPES Platform - Funcionalidades del Proyecto

## Descripcion

Plataforma web para descubrir MYPES (Micro y Pequenas Empresas) y tiendas locales. Permite a clientes consultar tiendas, productos y ubicacion en mapa, mientras que los propietarios (admins) administran su tienda y catalogo de productos.

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | Angular 20, TypeScript |
| Backend | Spring Boot 4, Java 17 |
| Seguridad | Spring Security, JWT (JJWT 0.11.5) |
| Base de datos | MySQL 8 (`db_mype`), Spring Data JPA, Hibernate |
| Tiempo real | WebSocket STOMP/SockJS |
| Mapas | Leaflet + OpenStreetMap |
| Voz | Web Speech API (es-PE) |
| Template engine | Thymeleaf (vistas heredadas) |
| Build | Maven (mvnw) |

## Roles

- **CLIENTE**: registra cuenta, inicia sesion, consulta tiendas y productos, usa mapa y busqueda por voz.
- **ADMIN**: propietario de una tienda. Al registrarse crea su tienda, gestiona productos (alta, imagenes) y administra datos de su tienda.

Roles persistidos en la entidad `Usuario` con enum `Rol` (`ADMIN`, `CLIENTE`). Autenticacion via JWT almacenado en `localStorage` del frontend y enviado como `Authorization: Bearer`.

## Modulos y Funcionalidades

### 1. Autenticacion y Registro

| Funcion | Ruta API | Metodo | Acceso |
|---------|----------|--------|--------|
| Registrar usuario | `/auth/register` | POST | Publico |
| Iniciar sesion (devuelve JWT + rol) | `/auth/login` | POST | Publico |
| Verificar rol admin | `/productos/check-admin` | GET | Autenticado |

- Registro de ADMIN encadena: crear usuario -> login automatico -> crear tienda propia.
- Passwords encriptados con BCrypt.

### 2. Tiendas

| Funcion | Ruta API | Metodo | Acceso |
|---------|----------|--------|--------|
| Listar todas las tiendas | `/api/tienda/listar` | GET | Publico |
| Obtener mi tienda | `/api/tienda/mi-tienda` | GET | ADMIN |
| Crear tienda | `/api/tienda/guardar` | POST | ADMIN |
| Actualizar imagen de tienda | `/api/tienda/{id}/imagen` | PUT | ADMIN |

- Cada tienda tiene: nombre, direccion, telefono, coordenadas (lat/lng), imagen y un propietario unico (relacion 1:1 con usuario ADMIN).
- Frontend permite filtrar tiendas por nombre.

### 3. Productos

| Funcion | Ruta API | Metodo | Acceso |
|---------|----------|--------|--------|
| Listar todos los productos | `/productos/listar` | GET | Publico |
| Productos de mi tienda | `/productos/mi-tienda` | GET | ADMIN |
| Crear producto | `/productos/guardar` | POST | ADMIN |

- Cada producto tiene: nombre, precio, stock, imagen y pertenece a una tienda.
- Alta de productos con validaciones de formulario en frontend.

### 4. Subida de Imagenes

| Funcion | Ruta API | Metodo | Acceso |
|---------|----------|--------|--------|
| Subir archivo imagen | `/api/imagen/subir` | POST | Publico |

- Archivos almacenados en carpeta `uploads/`.
- Limite de 10 MB por archivo.
- URLs de imagenes servidas desde `/uploads/**`.

### 5. Mapa y Geolocalizacion

- Ruta de cliente: `/mapa`
- Mapa interactivo con Leaflet/OpenStreetMap.
- Muestra marcadores de tiendas con coordenadas.
- Geolocalizacion del navegador para centrar mapa en ubicacion actual del usuario.
- Ruta de admin en `/mi-tienda` tambien integra mapa para ubicar su tienda.

### 6. Busqueda por Voz

- Componente `VoiceSearchComponent` integrado en la vista de tiendas.
- Usa Web Speech API con idioma `es-PE`.
- Transcripcion del audio para filtrar tiendas/productos.

### 7. Tiempo Real (WebSocket)

| Funcion | Endpoint | Protocolo |
|---------|----------|-----------|
| Enviar mensaje | `/api/websocket/send` | POST REST |
| Suscribirse a mensajes | `/topic/messages` | STOMP/SockJS |

- Broker STOMP con SockJS habilitado en `/ws`.
- Mensajes transmitidos a todos los suscriptores.

### 8. Vistas Thymeleaf (heredadas)

- Vistas en `/templates/`: home, login, registro, detalle tienda, gestion tienda, alta producto.
- Coexisten con el frontend Angular.

## Rutas Frontend

| Ruta | Vista | Rol |
|------|-------|-----|
| `/home` | Inicio | Publico |
| `/tiendas` | Catalogo de tiendas | Publico/CLIENTE |
| `/mapa` | Mapa interactivo | CLIENTE |
| `/buscar` | Busqueda textual y por voz | CLIENTE |
| `/mi-tienda` | Panel administrador | ADMIN |
| `/login` | Inicio de sesion | Publico |
| `/register` | Registro de usuario | Publico |

## Estructura del Proyecto

```
ProyectoWEB/
├── MypesPlatform/
│   ├── Backend/
│   │   └── platform/
│   │       └── platform/              # Proyecto Spring Boot
│   │           ├── pom.xml
│   │           ├── mvnw / mvnw.cmd
│   │           ├── uploads/           # Imagenes subidas
│   │           └── src/main/java/com/mypes/platform/
│   │               ├── config/        # WebConfig, DataSeeder
│   │               ├── controller/    # Auth, Tienda, Producto, Imagen, WebSocket, View
│   │               ├── dto/           # RegisterRequest, LoginRequest
│   │               ├── entity/        # Usuario, Tienda, Producto, Pedido, DetallePedidos, Rol
│   │               ├── repository/    # JPA repositories
│   │               ├── security/      # JwtUtil, JwtFilter, SecurityConfig, CustomUserDetailsService
│   │               └── service/       # AuthService, TiendaService, ProductoService, PedidoService
│   └── Frontend/
│       └── src/app/
│           ├── componentes/           # register, tiendas, admin-productos, mapa, voice-search
│           ├── interceptors/          # auth-interceptor
│           ├── servicios/             # auth, tienda
│           └── app.routes.ts
├── audit/
└── FUNCIONALIDADES_PROYECTO.md
```

## Configuracion Local

- **Backend**: Puerto `8880`, necesita MySQL corriendo en `localhost:3306` con base `db_mype`.
- **Frontend**: Puerto `4200` (Angular dev server).
- **CORS**: Backend permite origen `http://localhost:4200`.
- **Hibernate**: DDL automatico (`ddl-auto=update`).

## Brechas / Pendientes

- **Pedidos**: Entidad `Pedido` y `DetallePedidos` definidas pero sin controlador REST ni implementacion funcional.
- **Busqueda por producto**: Frontend llama `GET /productos/buscar` pero no existe endpoint en `ProductoController`.
- **Imagen de producto**: Frontend llama `PUT /productos/{id}/imagen` pero no existe endpoint en `ProductoController`.
- **Eliminar/actualizar producto**: `ProductoServiceImpl` declara metodos sin implementar.
- **Credenciales de BD**: Hardcodeadas en `application.properties`; deben externalizarse antes de produccion.
