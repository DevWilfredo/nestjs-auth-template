# 🔐 Sistema de Autenticación con NestJS – Plantilla Base

> ⚡ Proyecto base modular y listo para producción, construido con **NestJS**, **Prisma**, **JWT** y **Nodemailer**, con documentación en **Swagger** y pruebas unitarias configuradas.

---

## 📘 Descripción General

Este proyecto es una **plantilla de sistema de autenticación con NestJS**, diseñada para servir como base sólida para futuras aplicaciones.  
Incluye gestión completa de usuarios, autenticación, verificación por correo electrónico, manejo de roles, y un sistema de pruebas unitarias.  

También cuenta con documentación generada automáticamente con **Swagger** para explorar y probar los endpoints de forma interactiva.

---

## 🧱 Características Principales

✅ **Gestión de Usuarios**  
- Crear, actualizar, eliminar y listar usuarios.  
- Integración con **Prisma ORM** para la base de datos.  
- Validación mediante **class-validator** y **DTOs**.

✅ **Autenticación con JWT**  
- Registro e inicio de sesión con email y contraseña.  
- Generación y validación de tokens JWT.  
- Protección de rutas con `JwtAuthGuard`.

✅ **Seguridad de Contraseñas**  
- Hashing seguro utilizando **Argon2**.  
- Comparación de contraseñas con seguridad criptográfica.

✅ **Verificación de Correo Electrónico**  
- Envío de correos mediante **Nodemailer** y **Handlebars**.  
- Plantillas de verificación configurables.  
- Tokens únicos para verificación de usuarios.

✅ **Manejo de Errores**  
- Uso de excepciones HTTP nativas de NestJS.  
- Mapeo de errores comunes de Prisma.

✅ **Pruebas Unitarias**  
- Pruebas unitarias con **Jest** para servicios y controladores.  
- Mocks de dependencias (Prisma, EmailService, etc.).

✅ **Documentación con Swagger**  
- Documentación automática de la API disponible en:  
  📄 **`http://localhost:3000/api/docs`**

✅ **Variables de Entorno**  
- Archivo `.env.example` incluido.  
- Configuración flexible para JWT, SMTP y base de datos.

---

## ⚙️ Tecnologías Utilizadas

| Categoría        | Tecnología         |
|------------------|--------------------|
| Framework        | [NestJS](https://nestjs.com) |
| ORM              | [Prisma](https://www.prisma.io) |
| Base de datos    | PostgreSQL / MySQL / SQLite (configurable) |
| Autenticación    | JWT (`@nestjs/jwt`) |
| Hashing          | Argon2 |
| Envío de Emails  | Nodemailer + Handlebars |
| Validación       | class-validator / class-transformer |
| Pruebas          | Jest + Supertest |
| Configuración    | @nestjs/config |
| Documentación    | Swagger (OpenAPI) |

---

## 🚀 Guía de Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/auth-system.git
cd auth-system
```

---

### 2️⃣ Instalar Dependencias

```bash
pnpm install
# o
npm install
```

---

### 3️⃣ Configurar Variables de Entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Y reemplaza los valores según tu entorno:

```env
# ======================================
# 🌐 Configuración General de la App
# ======================================
APP_URL=http://localhost:3000
APP_NAME=Auth System

# ======================================
# 💾 Conexión a la Base de Datos
# ======================================
DATABASE_URL=postgresql://usuario:password@localhost:5432/authdb?schema=public

# ======================================
# 📧 Configuración de Correo (SMTP)
# ======================================
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu-correo@example.com
SMTP_PASS=tu-contraseña
SMTP_FROM="Auth System" <no-reply@example.com>

# ======================================
# 🔐 Configuración de JWT
# ======================================
JWT_SECRET=super_secreto_seguro
JWT_EXPIRES_IN=3600s
```

> 💡 **Nota:** asegúrate de configurar correctamente la URL de conexión de Prisma (DATABASE_URL) según tu base de datos.

---

### 4️⃣ Inicializar la Base de Datos

Ejecuta las migraciones de Prisma:

```bash
npx prisma migrate dev
```

Y si deseas ver la base de datos de forma visual:

```bash
npx prisma studio
```

---

### 5️⃣ Ejecutar la Aplicación

```bash
npm run start:dev
```

Por defecto, la aplicación correrá en **http://localhost:3000**

---

## 📡 Endpoints Principales

### 🔐 Rutas de Autenticación

| Método | Ruta | Descripción |
|---------|------|-------------|
| `POST` | `/auth/register` | Registra un nuevo usuario y envía correo de verificación |
| `POST` | `/auth/login` | Inicia sesión y devuelve un token JWT |
| `GET` | `/auth/verify-email?token=XYZ` | Verifica el correo electrónico de un usuario |

### 👤 Rutas de Usuarios

| Método | Ruta | Autenticación | Descripción |
|---------|------|---------------|-------------|
| `GET` | `/users` | ❌ | Listar todos los usuarios |
| `GET` | `/users/profile` | ✅ | Obtener perfil del usuario autenticado |
| `PATCH` | `/users/update` | ✅ | Actualizar los datos del usuario actual |
| `DELETE` | `/users/:id` | ✅ (Admin) | Eliminar un usuario por ID |

---

## 🧪 Pruebas

### 🧩 Pruebas Unitarias

Ejecuta las pruebas unitarias con:

```bash
npm run test
```

Incluyen tests para:
- `AuthService`
- `AuthController`
- `UserService`
- `EmailService`
- `PrismaService`

Estas pruebas utilizan **mocks** para simular dependencias y verificar el correcto funcionamiento de cada módulo.

---

### 🧱 Pruebas End-to-End (E2E)

El proyecto incluye un entorno inicial configurado en `/test/app.e2e-spec.ts`.

Ejecuta las pruebas E2E con:

```bash
npm run test:e2e
```

> ⚠️ Si usas base de datos real o correo SMTP, asegúrate de configurar un `.env.test` con valores de prueba.

---

## 📨 Plantillas de Correo

Las plantillas están en:

```
src/email/templates/
```

El proyecto incluye una plantilla de verificación (`verification.template.hbs`), la cual puedes modificar libremente.

Puedes agregar más plantillas personalizadas y enviar correos dinámicos utilizando variables dentro del `SendEmailDto`:

```ts
templateVars: {
  name: 'Wilfredo',
  verificationUrl: 'https://miapp.com/verify?token=123'
}
```

---

## 📄 Documentación Swagger

La documentación de la API está disponible automáticamente en:

```
http://localhost:3000/api/docs
```

Permite **probar los endpoints** directamente desde el navegador y ver los **DTOs**, **tipos de respuesta**, y **códigos de estado** de cada endpoint.

---

## 🧩 Estructura del Proyecto

```
src/
 ├── auth/          # Módulo de autenticación (login, registro, verificación)
 ├── users/         # Gestión de usuarios
 ├── email/         # Servicio de correo con Nodemailer
 ├── prisma/        # Configuración de Prisma ORM
 ├── app.module.ts  # Módulo raíz
 └── main.ts        # Punto de entrada
```

---

## 🧠 Extensiones y Mejoras Futuras

Algunas ideas para extender esta plantilla:

- 🔁 Implementar **tokens de refresco** para sesiones largas  
- 🔒 Agregar **restablecimiento de contraseña**  
- 👥 Manejar múltiples roles o permisos avanzados  
- 🪪 Integrar OAuth (Google, GitHub, etc.)  
- 📁 Añadir subida de archivos (avatars, documentos, etc.)  
- 📊 Añadir logs o monitoreo con Winston o Pino  

---

## 🛠️ Comandos Útiles

| Comando | Descripción |
|----------|-------------|
| `npm run start:dev` | Inicia la aplicación en modo desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm run test` | Ejecuta pruebas unitarias |
| `npm run test:e2e` | Ejecuta pruebas end-to-end |
| `npx prisma migrate dev` | Ejecuta migraciones de la base de datos |
| `npx prisma studio` | Abre el visualizador de base de datos |

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.  
Puedes usarlo, modificarlo y distribuirlo libremente.

---

## 👨‍💻 Autor

**Wilfredo Pinto**  
Desarrollador Full-Stack | Especialista en Backend (NestJS + Prisma + PostgreSQL)  
📧 [wilfredopintomata@gmail.com](mailto:wilfredopintomata@gmail.com)  
🌐 [wilfredodev.com](https://wilfredodev.com)

---

> 💡 *Este proyecto fue creado como una plantilla base moderna y modular para sistemas de autenticación en NestJS. Ideal para escalar, extender y reutilizar en futuros desarrollos.*
