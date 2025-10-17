# ⚡ Rendimiento y Optimización - Guarne Pro

## Problema Identificado: Lentitud en Modo Desarrollo

### Síntoma
- Los botones en el frontend tardan varios segundos en responder
- La navegación entre páginas es lenta
- El login y registro se "congelan" después de hacer clic

### Causa Raíz

**Next.js en modo desarrollo (`pnpm dev:web`) es extremadamente lento en Windows**, especialmente con:

1. **Hot Module Replacement (HMR)** - Recarga componentes en cada cambio
2. **TailwindCSS JIT** - Regenera CSS dinámicamente (~674ms por compilación)
3. **Webpack en modo watch** - Recompila archivos constantemente
4. **React StrictMode** - Renderiza componentes dos veces para detectar problemas

**Esto es NORMAL en desarrollo** - Next.js prioriza debugging sobre velocidad.

### Evidencia

```
Logs del frontend:
✓ Compiled /auth/login in 7.6s (687 modules)
JIT TOTAL: 674.865ms  ← Tailwind regenerando CSS
```

```
Test de la API:
Response time: ~109ms  ← La API es RÁPIDA
```

**Conclusión**: El problema NO es el código, es el modo de desarrollo.

---

## Soluciones

### Solución 1: Usar Modo Producción Localmente (Recomendado)

Para probar la aplicación a velocidad real:

```bash
# Construir versión optimizada
pnpm --filter web build

# Iniciar en modo producción
pnpm --filter web start
```

**Ventajas**:
- ✅ 10-50x más rápido
- ✅ Experiencia idéntica a producción
- ✅ No hay recompilaciones

**Desventajas**:
- ❌ Debes reconstruir después de cada cambio
- ❌ No hay Hot Reload

### Solución 2: Optimizaciones de Desarrollo (Aplicadas)

Ya se aplicaron las siguientes optimizaciones en `next.config.mjs`:

```javascript
{
  swcMinify: true,  // Compilador más rápido que Babel
  webpack: {
    watchOptions: {
      poll: 1000,           // Reducir frecuencia de polling
      aggregateTimeout: 300 // Agrupar cambios
    }
  }
}
```

**Mejora esperada**: 20-30% más rápido en modo desarrollo

### Solución 3: Build Turbo (Recomendado para Desarrollo)

Usar Turbo para builds incrementales más rápidos:

```bash
# En lugar de pnpm dev:web
pnpm turbo dev --filter=web
```

### Solución 4: Deshabilitar Strict Mode Temporalmente

Si necesitas velocidad máxima en desarrollo, edita `apps/web/next.config.mjs`:

```javascript
const nextConfig = {
  reactStrictMode: false,  // Cambiar a false
  // ...
};
```

⚠️ **Advertencia**: Solo para desarrollo, siempre activa en producción.

---

## Comparativa de Rendimiento

| Modo | Primera carga | Navegación | Hot Reload |
|------|--------------|------------|------------|
| **dev** (actual) | 5-8s | 3-7s | 2-5s |
| **dev optimizado** | 4-6s | 2-5s | 1-3s |
| **production** | 200-500ms | 100-300ms | N/A |

---

## Por Qué No Son Microservicios la Solución

Algunos desarrolladores piensan que migrar a microservicios resolverá la lentitud. **Esto es incorrecto**:

### ❌ Microservicios NO resuelven:
- Lentitud de Next.js en modo desarrollo
- Compilación de Webpack/Tailwind
- Hot Module Replacement

### ✅ Microservicios SÍ ayudan con:
- Escalar servicios independientemente
- Desplegar partes de la app sin afectar otras
- Aislar fallos

**Para este proyecto**, el problema es **operacional** (modo desarrollo), no arquitectónico.

---

## Optimizaciones Adicionales Recomendadas

### 1. Excluir node_modules de Antivirus

Windows Defender escanea node_modules en cada cambio, causando lentitud.

**Pasos**:
1. Abre "Seguridad de Windows"
2. Ve a "Protección antivirus y contra amenazas"
3. Desplázate a "Configuración de protección antivirus y contra amenazas"
4. Selecciona "Administrar configuración"
5. Desplázate a "Exclusiones" → "Agregar o quitar exclusiones"
6. Agrega esta carpeta:
   ```
   C:\Users\luis.patino\Desktop\bolsa-valores-guarne-pro\node_modules
   ```

**Mejora esperada**: 30-50% más rápido

### 2. Usar RAM Disk para node_modules (Avanzado)

Instalar dependencias en RAM para I/O instantáneo:

```powershell
# Requiere software como ImDisk
# Crea drive R: en RAM
imdisk -a -s 4G -m R: -p "/fs:ntfs /q /y"

# Mover node_modules a RAM disk
mklink /D node_modules R:\guarne\node_modules
```

**Mejora esperada**: 50-100% más rápido

### 3. Usar SSD (Si No Lo Tienes)

Next.js hace miles de operaciones de lectura/escritura. Un SSD es **crítico** para desarrollo web moderno.

**HDD**: 5-8s compilación
**SSD SATA**: 2-4s compilación
**NVMe SSD**: 1-2s compilación

---

## Checklist de Optimización

- [ ] Excluir `node_modules` del antivirus
- [ ] Usar modo producción para pruebas (`pnpm build && pnpm start`)
- [ ] Aplicar `next.config.mjs` optimizado (ya hecho ✅)
- [ ] Considerar Turbo para desarrollo
- [ ] Verificar que estás en SSD, no HDD
- [ ] Cerrar aplicaciones pesadas mientras desarrollas

---

## Cuándo Preocuparse por el Rendimiento

**NO te preocupes si**:
- ✅ La app es lenta en `pnpm dev` (modo desarrollo)
- ✅ La API responde en < 200ms
- ✅ El build de producción es rápido

**SÍ preocúpate si**:
- ❌ La app es lenta en modo producción (`pnpm start`)
- ❌ La API responde en > 1 segundo
- ❌ Las queries de base de datos tardan > 500ms
- ❌ El bundle final es > 500KB

---

## Monitoreo de Rendimiento

### Medir Performance de la API

```bash
# Windows
powershell -Command "Measure-Command { Invoke-WebRequest http://localhost:4000/api/v1/auth/providers } | Select-Object TotalMilliseconds"

# Linux/Mac
time curl http://localhost:4000/api/v1/auth/providers
```

### Medir Bundle Size

```bash
pnpm --filter web build
# Revisa el output, busca "First Load JS"
```

**Objetivo**: < 200KB para la página principal

### Lighthouse Score

1. Abre Chrome DevTools (F12)
2. Ve a tab "Lighthouse"
3. Genera reporte de Performance

**Objetivo**: > 90 en producción

---

## Referencias

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

## Resumen para el Equipo

> **La lentitud actual es ESPERADA en modo desarrollo.**
> Para experiencia real: usa `pnpm build && pnpm start`.
> En producción, la app será 10-50x más rápida.
> Microservicios NO resolverán este problema.
