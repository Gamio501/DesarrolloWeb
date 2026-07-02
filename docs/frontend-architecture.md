# Frontend Architecture — MypesPlatform

> **Fecha:** 2026-06-30
> **Stack:** Angular 20 + TypeScript 5.9 + Vite + Leaflet + JWT

---

## 1. Resumen

Frontend SPA (Single Page Application) construido con Angular 20 en modo **standalone components** (sin NgModules). Utiliza lazy loading en todas las rutas, formularios reactivos, interceptores funcionales HTTP y guards funcionales de ruta. Se comunica con el backend Spring Boot en `http://localhost:8880`.

---

## 2. Estructura del Proyecto

```
src/
├── index.html                    # Entry point HTML
├── main.ts                       # bootstrapApplication(App, appConfig)
├── styles.scss                   # Estilos globales (VACÍO)
└── app/
    ├── app.ts                    # Root component standalone
    ├── app.html                  # <router-outlet />
    ├── app.scss                  # (VACÍO)
    ├── app.config.ts             # Providers globales
    ├── app.routes.ts             # Definición de rutas con lazy loading
    ├── app.spec.ts               # Test básico
    ├── core/
    │   ├── guards/
    │   │   └── auth.guard.ts     # authGuard + adminGuard
    │   ├── interceptors/
    │   │   └── auth.interceptor.ts  # JWT Bearer interceptor
    │   ├── models/
    │   │   ├── auth.models.ts    # LoginRequest, RegisterRequest, AuthResponse, RegisterResponse
    │   │   └── platform.models.ts # ProductoDTO, TiendaDTO
    │   └── services/
    │       ├── auth.service.ts           # Login, register, logout, JWT decode
    │       ├── geolocalizacion.service.ts # Navigator Geolocation API wrapper
    │       ├── producto.service.ts       # CRUD productos
    │       └── tienda.service.ts         # CRUD tiendas
    └── componentes/
        ├── home/                 # Listado público de productos
        ├── formlogin/            # Login de usuarios
        ├── register/             # Registro de usuarios
        ├── navbar/               # Barra de navegación (no integrada)
        ├── mi-tienda/            # Gestión de tienda (admin)
        ├── agregar-producto/     # Crear producto (admin)
        ├── tienda/               # Vista pública de tienda (placeholder)
        └── mapa/                 # Mapa Leaflet (incompleto, solo HTML)
```

---

## 3. Arquitectura en Capas

```
┌─────────────────────────────────────────────────────┐
│                    COMPONENTES                       │
│  (Presentación: TS + HTML + SCSS)                   │
│  home | formlogin | register | navbar |             │
│  mi-tienda | agregar-producto | tienda | mapa       │
└────────────────────┬────────────────────────────────┘
                     │ Inyección de dependencias
┌────────────────────▼────────────────────────────────┐
│                    SERVICIOS                         │
│  (Lógica de negocio + HTTP cliente)                 │
│  AuthService | TiendaService | ProductoService      │
│  GeolocalizacionService                             │
└────────────────────┬────────────────────────────────┘
                     │ HTTP requests (con JWT)
┌────────────────────▼────────────────────────────────┐
│               HTTP INTERCEPTOR                      │
│  auth.interceptor.ts → Authorization: Bearer <jwt>  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
            Backend (http://localhost:8880)
```

---

## 4. Flujo de Arranque

```
main.ts
  └─► bootstrapApplication(App, appConfig)
        ├─ provideRouter(routes)          ← Lazy loading
        ├─ provideHttpClient(
        │     withInterceptors([authInterceptor])
        │   )                             ← JWT en todas las requests
        ├─ provideZoneChangeDetection()   ← Change detection
        └─ provideBrowserGlobalErrorListeners()

App Component (selector: app-root)
  └─► <router-outlet /> renderiza la ruta activa
```

---

## 5. Sistema de Rutas

| Ruta | Componente | Guard | Carga |
|------|-----------|-------|-------|
| `/` | redirect → `/home` | - | - |
| `/home` | `Home` | - | Lazy |
| `/login` | `Formlogin` | - | Lazy |
| `/register` | `Register` | - | Lazy |
| `/tienda/:id` | `Tienda` | - | Lazy |
| `/mi-tienda` | `MiTienda` | `adminGuard` | Lazy |
| `/agregar-producto` | `AgregarProducto` | `adminGuard` | Lazy |
| `**` | redirect → `/home` | - | - |

Todas las rutas usan `loadComponent()` (lazy loading nativo de Angular).

---

## 6. Seguridad

### 6.1 Flujo de Autenticación

```
Usuario →
  POST /auth/login { username, password } →
    backend retorna { token } →
      localStorage.setItem('jwt_token', token) →
        BehaviorSubject isLoggedIn.next(true)
```

### 6.2 Auth Interceptor

```typescript
// Funcional, no clase
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};
```

### 6.3 Guards

- **`authGuard`** → verifica `hasToken()` (token existe y no expiró). Si no, redirige a `/login`.
- **`adminGuard`** → verifica `hasToken() && isAdmin()`. Si no es admin, redirige a `/home`. Si no hay token, a `/login`.

### 6.4 JWT Decode

```typescript
interface JwtPayload {
  sub: string;           // username
  roles?: string[];      // ["ROLE_ADMIN"]
  role?: string;         // fallback
  exp: number;           // timestamp de expiración
}
```

Roles aceptados: `'ROLE_ADMIN'` o `'ADMIN'`

---

## 7. Servicios y Endpoints

### AuthService
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `login(req)` | `POST /auth/login` | Autentica y guarda JWT |
| `register(req)` | `POST /auth/register` | Registra nuevo usuario |
| `logout()` | - | Elimina token, redirige a /login |
| `hasToken()` | - | Verifica token válido no expirado |
| `isAdmin()` | - | Decodifica JWT y verifica rol ADMIN |
| `getUsername()` | - | Obtiene username del JWT |

### TiendaService
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `miTienda()` | `GET /tienda/mi-tienda` | Tienda del admin autenticado |
| `findAll()` | `GET /tienda/todas` | Todas las tiendas (público) |
| `guardar(tienda)` | `POST /tienda/guardar` | Crear/actualizar tienda |

### ProductoService
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `listar()` | `GET /productos/listar` | Todos los productos (público) |
| `misProductos()` | `GET /productos/mi-tienda` | Productos de mi tienda |
| `guardar(producto)` | `POST /productos/guardar` | Guardar nuevo producto |

### GeolocalizacionService
| Método | Descripción |
|--------|-------------|
| `obtenerPosicion()` | Obtiene posición actual (Observable) |
| `observarPosicion()` | Observa posición en tiempo real |
| `cancelarObservacion()` | Cancela seguimiento continuo |

---

## 8. Modelos / DTOs

```typescript
// auth.models.ts
interface LoginRequest { username: string; password: string; }
interface RegisterRequest { username: string; password: string; rol: string; }
interface AuthResponse { token: string; }
interface RegisterResponse { message: string; }

// platform.models.ts
interface ProductoDTO {
  productoId?: number; nombre: string; precio: number;
  stock: number; tiendaId?: number; usuarioId?: number;
}
interface TiendaDTO {
  tiendaId?: number; nombre: string; direccion: string;
  telefono: string; usuarioId?: number;
  latitud?: number; longitud?: number;
}

// geolocalizacion.service.ts (interno)
interface CoordenadaUsuario { latitud: number; longitud: number; precision: number; }
```

---

## 9. Componentes — Estado Detallado

### 9.1 Completos (TS funcional)

| Componente | TS | Lógica implementada |
|-----------|-----|---------------------|
| **Home** | 32 líneas | `OnInit` → `productoService.listar()`, loading/error |
| **Formlogin** | 49 líneas | Formulario reactivo, login, error 401 vs otros |
| **Register** | 53 líneas | Formulario reactivo, registro, error 409 |
| **AgregarProducto** | 50 líneas | Formulario reactivo, guardar, reset en éxito |
| **MiTienda** | 45 líneas | `OnInit` → tienda + productos, loading/error |
| **Navbar** | 23 líneas | `isLoggedIn$`, `logout()` |

### 9.2 Placeholder (sin lógica)

| Componente | Problema |
|-----------|----------|
| **Tienda** | Clase vacía, template "tienda works!" |

### 9.3 Incompleto

| Componente | Problema |
|-----------|----------|
| **Mapa** | Solo existe `mapa.html` (79 líneas). **Faltan** `mapa.ts` y `mapa.scss`. Variables TS referenciadas en HTML no existen. |

### 9.4 Problemas comunes

- **Todos los HTML** usan texto placeholder (ej: `<p>mi-tienda works!</p>`)
- **Todos los SCSS** están vacíos (0 líneas de CSS)
- **Navbar** no está integrado en `app.html` (solo existe `<router-outlet />`)
- **Variables de error/éxito** en TS no se renderizan en los templates
- **Mapa** tiene el HTML completo con panel lateral + Leaflet + leyenda, pero sin lógica

---

## 10. Dependencias

### Producción
| Paquete | Versión | Uso |
|---------|---------|-----|
| `@angular/core` | ^20.3.0 | Framework |
| `@angular/common` | ^20.3.0 | Directivas, pipes |
| `@angular/compiler` | ^20.3.0 | Compilador |
| `@angular/forms` | ^20.3.0 | ReactiveFormsModule |
| `@angular/platform-browser` | ^20.3.0 | Renderizado |
| `@angular/router` | ^20.3.0 | Rutas, guards |
| `jwt-decode` | ^4.0.0 | Decodificar JWT |
| `leaflet` | ^1.9.4 | Mapas interactivos |
| `rxjs` | ~7.8.0 | Programación reactiva |

### Desarrollo
| Paquete | Versión | Uso |
|---------|---------|-----|
| `@angular/build` | ^20.3.3 | Build Vite |
| `@angular/cli` | ^20.3.3 | CLI |
| `@types/jasmine` | ~5.1.0 | Tipos Jasmine |
| `@types/leaflet` | ^1.9.21 | Tipos Leaflet |
| `jasmine-core` | ~5.9.0 | Testing |
| `karma` | ~6.4.0 | Test runner |
| `typescript` | ~5.9.2 | Compilador TS |

> **Nota:** No hay librerías UI (Angular Material, Bootstrap). No hay NgRx/Signals store. No hay PWA, SSR ni i18n.

---

## 11. Patrones y Convenciones

| Patrón | Uso |
|--------|-----|
| Standalone Components | Todos los componentes, sin NgModules |
| Lazy Loading | `loadComponent()` en todas las rutas |
| Reactive Forms | Formularios con FormBuilder + Validators |
| Functional Interceptors | `HttpInterceptorFn` (no clase) |
| Functional Guards | `CanActivateFn` (no clase) |
| BehaviorSubject + Observable | Estado de login en AuthService |
| DTO Pattern | Interfaces que mapean DTOs Java del backend |
| Singleton Services | `providedIn: 'root'` |
| RxJS | Observable, BehaviorSubject, tap, pipe |

---

## 12. Pendientes y Deuda Técnica

1. **Templates HTML** — Todos los componentes necesitan templates reales
2. **Estilos SCSS** — 0% de estilos implementados, todos los archivos vacíos
3. **Componente Mapa** — Crear `mapa.ts` y `mapa.scss` para completar el HTML existente
4. **Navbar** — Integrar en `app.html` para que se renderice globalmente
5. **Mensajes de error/éxito** — Renderizar `errorMessage` y `successMessage` en los templates
6. **Manejo global de errores HTTP** — Crear un `HttpErrorInterceptor` global
7. **Variables de entorno** — Centralizar `API_URL` en `src/environments/`
8. **Pruebas unitarias** — Implementar tests con servicios mockeados
9. **Librería UI** — Considerar Angular Material o Bootstrap para acelerar desarrollo
10. **Ruta del mapa** — Registrar el componente mapa en `app.routes.ts`
