# Portal de Inspección de Seguridad y Salud en el Trabajo GTC 45 🇨🇴

Este es un portal interactivo y responsivo especializado para la inspección y el registro de hallazgos de Seguridad y Salud en el Trabajo (SST), modelado rigurosamente según las pautas de la **Guía Técnica Colombiana GTC 45** (para la identificación de peligros y valoración de riesgos).

---

## 🚀 Características del Proyecto

- **Clasificación según GTC 45**: Clasificación dinámica de peligros por factores de riesgo colombianos (Biológico, Físico, Químico, Psicosocial, Biomecánico, Condiciones de seguridad, Fenómenos naturales).
- **Cálculo Automático**: Determina de forma automática e inmediata los niveles de Deficiencia (ND), Exposición (NE), Probabilidad (NP), Consecuencias (NC), Nivel de Riesgo (NR), el Tier de intervención (I, II, III, IV) y la Aceptabilidad del riesgo.
- **Asistente IA Copiar/Pegar**: Genera automáticamente un prompt especializado estructurado para enviar a IAs externas (como ChatGPT, Gemini o Claude) conteniendo tus observaciones y permite pegar de vuelta la respuesta (en formato JSON o texto libre) cargando instantáneamente toda la clasificación del peligro, controles jerárquicos y planes de acción recomendados.
- **Exportación Profesional a Excel**: Descarga con un solo clic una plantilla completa estructurada que encaja exactamente con el formato de la clásica **Matriz de Riesgos y Peligros GTC 45** utilizada por los inspectores y profesionales SST en Colombia.
- **Persistencia Local**: Conserva todos los hallazgos en el navegador de tu computadora utilizando el almacenamiento local del cliente (`localStorage`), garantizando que tus registros persistan de forma segura.

---

## 🛠️ Tecnologías Utilizadas

- **React 18** con **TypeScript**
- **Vite** (Compilador ultra rápido)
- **Tailwind CSS v4** (Diseño moderno y responsivo)
- **Lucide React** (Paquete completo de iconos vectoriales elegantes)
- **XLSX (SheetJS)** (Motor para el formateo y generación de informes de Excel)
- **Canvas Confetti** (Animación visual de éxito)

---

## 📦 Instrucciones para Correr en Local (Windows, macOS o Linux)

### Requisitos previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### Pasos de Configuración:

1. **Descarga el código**: Extrae el archivo ZIP descargado del portal en tu carpeta de trabajo:
   `C:\Users\chmed\Desktop\Mis proyectos\GITHUB repositorios\inspeccion\informe-de-inspeccion-gtc-45`
   
2. **Abre la terminal** (CMD, PowerShell o Git Bash) en esa ruta e instala las dependencias necesarias:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo local**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la aplicación ejecutándose.

4. **Para compilar el proyecto para Producción / GitHub Pages**:
   ```bash
   npm run build
   ```
   Esto generará los archivos optimizados dentro de una carpeta llamada `dist/` en la raíz de tu proyecto.

---

## 🌐 Despliegue Automatizado en GitHub Pages

Este repositorio cuenta con un flujo de integración continua totalmente automatizado a través de **GitHub Actions**. Ya no necesitas compilar y subir manualmente la carpeta `dist/`.

### Cómo funciona la automatización:

1. **Configuración Inicial en GitHub (Hecho)**:
   - En tu repositorio de GitHub, ve a **Settings** > **Pages**.
   - En la sección **Build and deployment > Source**, asegúrate de que esté seleccionado **GitHub Actions** (tal como se configuró).

2. **Flujo de Trabajo Diario**:
   Cada vez que hagas cambios en tus archivos en tu computadora local, ejecuta la siguiente secuencia de comandos en tu terminal de VS Code:
   ```bash
   # 1. Agrega todos los cambios realizados
   git add .

   # 2. Guarda tus cambios con un mensaje descriptivo
   git commit -m "Actualización: descripción de tus cambios"

   # 3. Sube los cambios a GitHub
   git push origin main
   ```

3. **Publicación Automática**:
   - Al ejecutar `git push`, GitHub activará automáticamente el Action configurado en `.github/workflows/deploy.yml`.
   - Podrás ver el progreso en tiempo real yendo a la pestaña **Actions** de tu repositorio en GitHub.
   - En 1-2 minutos, tu sitio se actualizará automáticamente en la URL pública correspondiente:
     `https://entrenaconsultingsst-web.github.io/informe-de-inspeccion-gtc-45/`

---

## 🛠️ Solución a Conflictos Comunes al Subir Cambios

### Error: `[rejected] main -> main (fetch first)` o `Updates were rejected...`
Este error ocurre cuando en el repositorio de GitHub remoto hay cambios o commits (por ejemplo, el README creado inicialmente por GitHub) que tú no tienes descargados en tu computadora local.

**Solución definitiva (Forzar actualización)**:
Si estás seguro de que tu código local es el correcto y deseas sobrescribir cualquier archivo del repositorio remoto de GitHub con los de tu computadora local, ejecuta una sola vez:
```bash
git push origin main --force
```

**Solución conservadora (Fusionar cambios)**:
Si deseas traer los cambios remotos y fusionarlos con los tuyos antes de subir:
```bash
git pull origin main --rebase
git push origin main
```

---
Diseñado con enfoque profesional por e-learning y consultoría en SST.
