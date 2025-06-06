# 🔥 Configuración de Firebase

Para conectar la aplicación a Firebase, sigue estos pasos:

## 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Nombra tu proyecto (ej: "apple-quiz-app")
4. Opcional: Habilita Google Analytics
5. Crea el proyecto

## 2. Configurar Authentication

1. En la consola de Firebase, ve a **Authentication**
2. Haz clic en "Comenzar" o "Get started"
3. En la pestaña **Sign-in method**, habilita:
   - **Email/Password** (para profesores)
   - **Anonymous** (para estudiantes)

## 3. Configurar Firestore Database

1. Ve a **Firestore Database**
2. Haz clic en "Crear base de datos" o "Create database"
3. Selecciona **"Comenzar en modo de prueba"** (por ahora)
4. Elige una ubicación cercana a tus usuarios

## 4. Obtener Credenciales

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. En la pestaña **General**, baja hasta **"Tus aplicaciones"**
3. Haz clic en **"</>"** para crear una app web
4. Nombra tu app (ej: "Apple Quiz Web App")
5. **NO** marques "Configure Firebase Hosting"
6. Copia la configuración que aparece

## 5. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Reemplaza los valores en `.env` con los de tu proyecto:
   ```env
   VITE_FIREBASE_API_KEY=tu-api-key-aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
   VITE_FIREBASE_APP_ID=tu-app-id
   ```

## 6. Instalar Firebase CLI (Opcional)

```bash
npm install -g firebase-tools
firebase login
firebase init
```

## 7. Iniciar la Aplicación

```bash
npm run dev
```

## 8. Probar la Conexión

1. Ve a `http://localhost:5173`
2. Intenta registrarte como profesor
3. Crea un quiz
4. Inicia una sesión
5. Únete como estudiante en otra pestaña

## 9. Configurar Reglas de Producción (Importante)

Antes de lanzar en producción, actualiza las reglas de Firestore:

1. Ve a **Firestore Database > Reglas**
2. Reemplaza las reglas con el contenido de `firestore.rules`
3. Publica los cambios

## 🚨 Seguridad

- **NUNCA** subas el archivo `.env` a GitHub
- Las reglas actuales permiten acceso anónimo para testing
- Antes de producción, configura reglas más estrictas
- Considera habilitar App Check para mayor seguridad

## 🔧 Comandos Útiles

```bash
# Desarrollo con emuladores
npm run firebase:emulators

# Build y deploy
npm run deploy

# Solo build
npm run build
```

## ✅ Verificación

Si todo está configurado correctamente:
- ✅ Puedes crear cuenta de profesor
- ✅ Puedes crear y guardar quizzes
- ✅ Puedes iniciar sesiones en vivo
- ✅ Los estudiantes pueden unirse anónimamente
- ✅ Las respuestas se sincronizan en tiempo real