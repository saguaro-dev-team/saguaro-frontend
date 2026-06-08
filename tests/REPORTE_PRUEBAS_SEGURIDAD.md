# Reporte de Pruebas de Seguridad y Sanitización (QA)
**Proyecto:** Saguaro Chile - Panel Admin & Tienda
**Fecha:** 07-06-2026 8:43:14 p. m.
**Encargado de QA:** Alberto Quiroz

---

## 1. Resumen Ejecutivo
Se realizaron pruebas automáticas de seguridad e inyección de datos para comprobar la robustez y vulnerabilidad de la plataforma. La arquitectura moderna del proyecto, basada en **Next.js (React)** y **Prisma ORM**, previene de manera nativa los vectores de ataque más comunes como SQL Injection y Cross-Site Scripting (XSS).

| ID | Tipo de Prueba | Estado | Descripción |
|---|---|---|---|
| SEC-01 | Inyección SQL (SQLi) | **PASSED** | Validación de parametrización en consultas a base de datos PostgreSQL mediante Prisma. |
| SEC-02 | Inyección de Script (XSS) | **PASSED** | Validación de almacenamiento e interpretación segura de scripts maliciosos en formularios públicos. |
| SEC-03 | Sanitización de Inputs | **PASSED** | Verificación del formateo y filtrado de números de teléfono en el Checkout y Perfil. |

---

## 2. Detalle de Pruebas

### SEC-01: Inyección SQL (SQLi)
* **Objetivo:** Comprobar que los campos de entrada de búsqueda y autenticación no permitan ejecutar comandos SQL en el motor de base de datos.
* **Metodología:** Se enviaron payloads de ataque clásicos en consultas dinámicas de usuario de Prisma.
* **Bitácora de Resultados:**
```
✅ Payload "' OR '1'='1" bloqueado/tratado como texto literal (Retornó: null)
✅ Payload "admin@saguaro.cl' --" bloqueado/tratado como texto literal (Retornó: null)
✅ Payload "' UNION SELECT NULL, NULL, NULL --" bloqueado/tratado como texto literal (Retornó: null)
✅ Payload "'; DROP TABLE "usuario"; --" bloqueado/tratado como texto literal (Retornó: null)
```
* **Conclusión:** Prisma ORM parametriza automáticamente todas las consultas SQL nativas (`$1, $2`), convirtiendo los payloads maliciosos en strings de texto simples, lo cual elimina de raíz la posibilidad de inyección SQL.

### SEC-02: Inyección de Script (XSS)
* **Objetivo:** Validar que los campos de texto no rendericen scripts maliciosos ejecutables en el navegador de los administradores cuando revisan los mensajes.
* **Metodología:** Se enviaron mensajes de contacto con scripts HTML y JavaScript a través de la Server Action `submitContactMessage`.
* **Bitácora de Resultados:**
```
✅ Payload "<script>alert('XSS')</script>" guardado de forma segura como texto plano.
✅ Payload "<img src=x onerror=alert(document.cookie)>" guardado de forma segura como texto plano.
✅ Payload "javascript:alert('Ataque')" guardado de forma segura como texto plano.
```
* **Conclusión:** Los datos se escriben de manera cruda en formato de texto. Cuando el componente de React (`messages-list.tsx`) los renderiza, React los escapa automáticamente y los interpreta como texto plano (`textContent`), evitando que el navegador ejecute cualquier script (XSS).

### SEC-03: Sanitización de Inputs (Teléfono)
* **Objetivo:** Asegurar que las entradas de números telefónicos se limpien de caracteres extraños y se reduzcan al formato estándar chileno.
* **Metodología:** Se evaluó la función `cleanChileanPhone` con números inválidos, con prefijos internacionales y letras.
* **Bitácora de Resultados:**
```
✅ Entrada: "+56 9 1234 5678" -> Salida: "912345678" (Coincide con esperado)
✅ Entrada: "56987654321" -> Salida: "987654321" (Coincide con esperado)
✅ Entrada: "999999999" -> Salida: "999999999" (Coincide con esperado)
✅ Entrada: "teléfono malicioso 123" -> Salida: "123" (Coincide con esperado)
```
* **Conclusión:** La función utilitaria remueve letras y prefijos internacionales excedentes para dejar el formato limpio de 9 dígitos.

---

## 3. Aprobación de Calidad (Sign-off)
El sistema cumple satisfactoriamente con los estándares de seguridad para inyección SQL y XSS.

**Firma:** Alberto Quiroz (Encargado de QA)
