# Module Audit: ProyectoWEB

## Scope
Read-only source audit of marketplace project. Inspected nested Spring backend and Angular frontend, manifests, configuration, tests, integration points, and repository operational files. Skipped generated/dependency paths including `node_modules`, `dist`, `target`, and `.angular`.

Purpose: MYPE marketplace with public store/product browsing, map/geolocation, store/product administration, image uploads, voice search, JWT authentication, and a WebSocket broadcast endpoint. No deploy manifests, API specification, migration history, monitoring configuration, or production operations documentation found.

## Stack And Build
- Backend: Spring Boot 4.0.6, Java 17, Maven, Spring Web/Security/JPA/Validation/Thymeleaf/WebSocket, MySQL, JJWT, Lombok. `MypesPlatform/Backend/platform/platform/pom.xml:9-102`
- Frontend: Angular 20.3, TypeScript 5.9, RxJS, Leaflet/OpenStreetMap, STOMP/SockJS. `MypesPlatform/Frontend/package.json:24-51`
- Entrypoints: `.../PlatformApplication.java:6-11` and `MypesPlatform/Frontend/src/main.ts:1-6`.
- Backend uses local MySQL, `ddl-auto=update`, and port 8880. `.../src/main/resources/application.properties:2-13`
- Angular production build has hashes/budgets, but no environment-specific API configuration. `MypesPlatform/Frontend/angular.json:17-71`

## Architecture
Backend nominally follows controllers -> services -> Spring Data repositories -> JPA entities/MySQL. Controller persistence leakage exists: `TiendaController` accesses `TiendaRepository` directly. `.../controller/TiendaController.java:18,26-32,50-60`

Two UI systems coexist: Angular SPA and Spring Thymeleaf templates/controllers. `MypesPlatform/Frontend/src/app/app.routes.ts:13-55`; `.../controller/viewController.java:17-70`. Order entities/interfaces exist but no usable order service/controller flow. Product/store interfaces also advertise unimplemented operations that throw `UnsupportedOperationException`.

## Components And Data Flow
- Registration sends selected role to `POST /auth/register`; backend persists it. `.../componentes/register/register.ts:18-79`; `.../controller/AuthController.java:24-38`; `.../service/AuthService.java:33-76`
- Login authenticates then creates JWT containing username. Frontend stores token and role in `localStorage`; interceptor adds Bearer header. `.../security/JwtUtil.java:23-38`; `MypesPlatform/Frontend/src/app/servicios/auth.ts:27-52`
- Product creation derives owner/store from authenticated user, but store image mutation accepts arbitrary store ID. `.../service/impl/ProductoServiceImpl.java:42-88`; `.../controller/TiendaController.java:50-60`
- Public screens fetch entire store/product collections then filter client-side. `.../componentes/tiendas/tiendas.ts:28-65`; `.../componentes/tiendas-productos/tiendas-productos.ts:23-47`
- Image flow uploads before entity association. Product image association endpoint is currently absent from controller.
- Map inserts persisted store fields as Leaflet popup HTML. `.../componentes/mapa/mapa.ts:123-137`

## Dependencies And Integrations
- JDBC targets local MySQL using root credentials. `.../application.properties:2-9`
- Frontend and backend-generated upload URLs hardcode `http://localhost:8880`. `MypesPlatform/Frontend/src/app/servicios/auth.ts:15`; `.../servicios/tienda.ts:12`
- HTTP CORS permits local Angular origin; WebSocket permits all origins. `.../security/SecurityConfig.java:93-103`; `.../config/WebSocketConfig.java:20-24`
- External integrations: OpenStreetMap tiles, `ui-avatars.com`, and seeded external image URLs.
- No CI workflow, Docker/Compose, Kubernetes, or deployment configuration found.

## Patterns And Boundaries
- Angular uses standalone components, routes, guards, singleton services, and interceptor.
- REST DTOs separate product/store output from JPA entities.
- Spring Security role rules and service-level checks coexist, but frontend guards trust mutable browser state and direct controller repository use bypasses service policy.
- Data model gives `Usuario` one store; `Producto` links store/user; order/detail model is incomplete and unwired.

## Findings
- **CRITICAL: tracked MySQL root password.** `.../src/main/resources/application.properties:3-5`. Rotate immediately; remove secret from history where feasible; inject least-privilege credentials through environment/secret manager.
- **CRITICAL: public registration accepts client-selected `ADMIN`.** `.../dto/RegisterRequest.java:8-12`; `.../service/AuthService.java:33-51`. Ignore requested role publicly and assign `CLIENTE`; restrict elevation workflow.
- **HIGH: arbitrary admin can overwrite another store image.** `.../controller/TiendaController.java:50-60`. Move mutation to service and require authenticated ownership before update.
- **HIGH: unauthenticated upload is public arbitrary-file hosting.** `.../controller/ImagenController.java:23-54`; `.../security/SecurityConfig.java:41-52`. Require authorization; validate decoded image type/dimensions; generate safe filename/extension; store outside web root; add quotas/scanning.
- **HIGH: WebSocket accepts every origin and lacks destination authorization.** `.../config/WebSocketConfig.java:20-24`; `.../controller/WebSocketController.java:24-33`. Restrict origins, authenticate CONNECT, authorize publish/subscribe, and validate payloads.
- **HIGH: current frontend/backend API contract broken.** Frontend calls `GET /productos/buscar` and `PUT /productos/{id}/imagen`; `ProductoController` exposes neither. `MypesPlatform/Frontend/src/app/servicios/tienda.ts:46-57`; `.../controller/ProductoController.java:28-53`. Restore/version API or remove callers; add contract tests.
- **HIGH: stored XSS in Leaflet popup construction.** `MypesPlatform/Frontend/src/app/componentes/mapa/mapa.ts:123-137`. Build DOM/text nodes rather than interpolated HTML; validate store input server-side. XSS can steal localStorage JWTs.
- **HIGH: backend tests mutate configured local MySQL.** `.../application.properties:2-8`; `.../src/test/java/com/mypes/platform/repository/ProductoRepositoryTest.java:11-44`. Use Testcontainers/disposable test profile and rollback fixtures.
- **MEDIUM: JWT key hardcoded; JWT filter does not handle parse failures.** `.../security/JwtUtil.java:15-21,62-68`; `.../security/JwtFilter.java:52-66`. Externalize/rotate key and convert invalid tokens to controlled 401 responses.
- **MEDIUM: DTO validation and error mapping absent.** `.../controller/AuthController.java:24-33`; `.../dto/RegisterRequest.java:5-14`. Add constraints, `@Valid`, enum/range checks, and centralized 400/404/409 handling.
- **MEDIUM: hardcoded hosts and automatic schema update prevent portable deterministic deployment.** `.../application.properties:3-8`. Add dev/test/prod config, relative/configured URLs, Flyway/Liquibase, restricted DB user.
- **MEDIUM: unbounded list/search APIs and browser-side full-catalog filtering will not scale.** Add pagination, bounded indexed search, server filtering, response limits, and map clustering.
- **LOW: seeded predictable privileged accounts and diagnostic `System.out` logging.** `.../config/DataSeeder.java:42-69`; `.../security/JwtFilter.java:35-36`. Gate seed data to dev and use structured logging.
- **LOW: frontend specs are smoke tests; HTTP service setup is invalid/incomplete.** `MypesPlatform/Frontend/src/app/servicios/auth.spec.ts:8-15`; `.../servicios/tienda.spec.ts:8-15`. Use HTTP testing provider and test requests/errors.

## Test Coverage And Operational Readiness
Backend tests are context/repository smoke tests with mutation and weak assertions. Frontend specs mostly test creation. No inspected tests cover role escalation, ownership, upload validation, JWT expiry, WebSocket policy, XSS, contracts, pagination, or recovery. No e2e configuration, CI, health/readiness, metrics, rate limiting, backups, or runbook found. Tests were not run because configured test execution can mutate local MySQL.

## Recommendations
1. Rotate exposed DB secret; eliminate public admin registration; lock down uploads/WebSocket.
2. Restore or replace missing product APIs and add contract regression tests.
3. Centralize ownership authorization in services; remove controller repository mutations.
4. Add request validation, exception mapping, safe popup rendering, CSP, and robust token handling.
5. Separate dev/test/prod config; migrate with Flyway/Liquibase; use Testcontainers.
6. Paginate/search server-side; make upload association transactional; move uploads to managed storage.
7. Add CI, secrets/dependency scanning, health/metrics, deployment documentation, and a deliberate SPA-versus-Thymeleaf boundary.
