# 🔐 Configuración de Seguridad - Guarne Pro

## ⚠️ IMPORTANTE: Seguridad de Credenciales

Este documento explica cómo configurar credenciales seguras para el proyecto.

---

## 🚨 Problema Detectado

La contraseña `demo123` fue detectada en brechas de seguridad públicas. **NUNCA uses contraseñas comunes en producción.**

---

## ✅ Configuración Inicial Segura

### 1. Variables de Entorno del API

```bash
# Desde la raíz del proyecto
cd apps/api

# Copia el archivo de ejemplo
cp .env.example .env.local

# Genera claves seguras
openssl rand -hex 32  # Copia esto para JWT_SECRET
openssl rand -hex 32  # Copia esto para ENCRYPTION_KEY

# Edita .env.local y reemplaza:
# JWT_SECRET=<resultado del primer comando>
# ENCRYPTION_KEY=<resultado del segundo comando>
```

### 2. Usuario Administrador Inicial

**Contraseña temporal de desarrollo:** `demo123`

⚠️ **CAMBIAR INMEDIATAMENTE en producción**

**Para producción, usa una contraseña segura:**
- Mínimo 16 caracteres
- Combina mayúsculas, minúsculas, números y símbolos
- No uses palabras del diccionario
- Ejemplo: `G#9mK$2pL@8nQ!5x`

---

## 📝 Credenciales por Ambiente

### Desarrollo Local

| Servicio | Usuario | Contraseña | Notas |
|----------|---------|------------|-------|
| **Frontend** | `demo@guarne.pro` | `demo123` | ⚠️ Solo desarrollo |
| **PostgreSQL** | `guarne_dev` | `guarne_dev_pass_2024` | ⚠️ Solo desarrollo |
| **Redis** | - | - | Sin auth en dev |
| **Grafana** | `admin` | `admin_guarne_2024` | ⚠️ Solo desarrollo |
| **MinIO** | `guarne_minio` | `guarne_minio_pass_2024` | ⚠️ Solo desarrollo |

### Producción (TODO)

🔴 **NUNCA uses las credenciales de desarrollo en producción**

Pasos para producción:
1. Genera nuevas claves con `openssl rand -hex 32`
2. Usa contraseñas únicas de 20+ caracteres
3. Habilita autenticación en Redis
4. Configura HTTPS/TLS en todos los servicios
5. Implementa rotación de secretos
6. Usa un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)

---

## 🔒 Buenas Prácticas de Seguridad

### ✅ HACER:

1. **Variables de entorno**
   - Usa `.env.local` para secretos (NO se sube a GitHub)
   - Documenta variables en `.env.example` (SÍ va a GitHub)
   - Genera claves únicas por ambiente

2. **Contraseñas**
   - Usa generadores de contraseñas (LastPass, 1Password, Bitwarden)
   - Mínimo 16 caracteres en producción
   - Rota credenciales regularmente

3. **Repositorio**
   - `.env.local` está en `.gitignore`
   - Nunca hagas commit de secretos
   - Revisa cambios antes de hacer push

4. **API Keys de Exchanges**
   - Se guardan encriptadas en la base de datos
   - Usa la variable `ENCRYPTION_KEY`
   - Nunca las expongas en logs

### ❌ NO HACER:

1. ❌ Subir archivos `.env.local` a GitHub
2. ❌ Usar contraseñas comunes (`password`, `123456`, `demo123`)
3. ❌ Compartir credenciales por email/Slack
4. ❌ Hardcodear secretos en el código
5. ❌ Reutilizar contraseñas entre servicios
6. ❌ Usar credenciales de desarrollo en producción

---

## 🛡️ Detección de Brechas

Google Password Manager detectó que `demo123` aparece en brechas públicas de seguridad.

**¿Qué significa esto?**
- La contraseña es muy común
- Está en listas de diccionarios de hackers
- NO es segura para uso real

**¿Qué hacer?**
1. En desarrollo: está bien usarla (es temporal)
2. En producción: NUNCA la uses
3. Cambia todas las credenciales antes de deployment

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Guía de Secretos en GitHub](https://docs.github.com/en/code-security/secret-scanning)
- [12 Factor App - Config](https://12factor.net/config)
- [Generador de Contraseñas](https://1password.com/password-generator/)

---

## 🔄 Checklist de Seguridad

Antes de ir a producción:

- [ ] Generar nuevos JWT_SECRET y ENCRYPTION_KEY
- [ ] Cambiar todas las contraseñas de bases de datos
- [ ] Habilitar autenticación en Redis
- [ ] Configurar HTTPS en todos los servicios
- [ ] Revisar permisos de Docker containers
- [ ] Implementar rate limiting estricto
- [ ] Configurar firewall y reglas de red
- [ ] Habilitar auditoría de accesos
- [ ] Implementar 2FA para usuarios admin
- [ ] Configurar backup encriptado de base de datos

---

## 📞 Reporte de Vulnerabilidades

Si encuentras problemas de seguridad, NO los subas a GitHub.

Contacta directamente al equipo de desarrollo.
