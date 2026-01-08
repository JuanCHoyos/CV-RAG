# CV Knowledge Base Assistant 📚

## Descripción del Proyecto

Este proyecto es un **asistente conversacional inteligente** que permite hacer preguntas sobre tu Curriculum Vitae (CV) en formato PDF. El sistema utiliza inteligencia artificial para:

- **Cargar y procesar** documentos PDF de tu CV
- **Dividir el contenido** en fragmentos manejables para mejor comprensión
- **Generar embeddings** (representaciones vectoriales) del contenido usando AWS Bedrock
- **Almacenar vectores** en memoria para búsqueda de similitud rápida
- **Responder preguntas** sobre tu CV usando un agente de IA conversacional
- **Mantener contexto** de la conversación usando LanGraph

El asistente está diseñado para responder **únicamente con información del CV proporcionado**, sin usar conocimiento externo ni inventar datos.

## Requisitos Previos

- **Node.js**: v24.x o superior
- **pnpm**: v10.27.0 (gestor de paquetes)
- **AWS Credentials**: Acceso a AWS Bedrock con modelos configurados
- **PDF**: Archivo `cv.pdf` en la carpeta `sources/`

## Instalación y Configuración

### 1. Clonar o descargar el proyecto
```bash
cd tu-proyecto
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Crear archivo `.env` con variables de entorno
Copia y configura el siguiente archivo `.env` en la raíz del proyecto:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_SESSION_TOKEN=your_session_token_here

# AWS Bedrock Models
AWS_EMBEDDING_MODEL=amazon.titan-embed-text-v2:0
AWS_LLM_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
```

### 4. Preparar el documento PDF
Asegúrate de que tu CV esté guardado en:
```
sources/cv.pdf
```

### 5. Ejecutar el proyecto
```bash
pnpm dev
```

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **TypeScript** | ^25.0.3 | Lenguaje de programación |
| **Node.js** | v24.x | Runtime de JavaScript |
| **LangChain** | ^1.2.6 | Framework para aplicaciones de IA |
| **AWS Bedrock** | ^1.1.1 | LLM y embeddings |
| **LanGraph** | ^1.0.7 | Gestión de estado y memoria |
| **Chalk** | ^5.6.2 | Colorización de output en terminal |
| **Zod** | ^4.3.5 | Validación de esquemas |
| **tsx** | ^4.21.0 | Ejecutor TypeScript mejorado |

## Flujo de Funcionamiento

1. **Carga de PDF**: Se lee el archivo `cv.pdf`
2. **Fragmentación**: El contenido se divide en chunks de 1000 caracteres con overlap de 200
3. **Embeddings**: Cada fragmento se convierte en un vector usando AWS Bedrock
4. **Almacenamiento**: Los vectores se guardan en memoria
5. **Consulta**: El usuario hace una pregunta
6. **Búsqueda**: Se buscan los 2 fragmentos más similares a la consulta
7. **Respuesta**: El agente de IA responde basándose únicamente en esos fragmentos

## Uso

Una vez ejecutes `pnpm dev`, verás una interfaz interactiva:

```
You can now ask questions about the CV document. Type 'exit' to quit.
Question: ¿Cuáles son tus habilidades técnicas?
```

Escribe tus preguntas en cualquier idioma y el asistente responderá con información extraída de tu CV.

Para salir, escribe `exit`.

## Variables de Entorno

- **AWS_REGION**: Región de AWS donde se hospedan los servicios
- **AWS_ACCESS_KEY_ID**: Identificador de tu clave de acceso AWS
- **AWS_SECRET_ACCESS_KEY**: Clave secreta de acceso a AWS
- **AWS_SESSION_TOKEN**: Token de sesión (opcional para credenciales temporales)
- **AWS_EMBEDDING_MODEL**: Modelo para generar embeddings (vectorización)
- **AWS_LLM_MODEL**: Modelo de lenguaje para generar respuestas

## Estructura del Proyecto

```
kb/
├── index.ts                 # Archivo principal
├── package.json            # Dependencias y scripts
├── .env                    # Variables de entorno (no incluir en git)
├── sources/
│   └── cv.pdf             # Tu curriculum en PDF
└── README.md              # Este archivo
```

## Solución de Problemas

| Problema | Solución |
|----------|----------|
| `Error: Cannot find module` | Ejecuta `pnpm install` |
| `AWS credentials error` | Verifica las variables en `.env` |
| `PDF not found` | Asegúrate que `sources/cv.pdf` exista |
| `Node version error` | Actualiza Node.js a v24 o superior |
