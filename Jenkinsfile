pipeline {
    agent any

    environment {
        // Variables de entorno para la aplicación, Docker y SSH
        APP_NAME = "toolflow-frontend"
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials-id')
        DOCKER_IMAGE = "kev405/toolflow-frontend"
        SSH_USER = "root"
        SSH_HOST = "185.194.216.54"
    }

    stages {
        stage('Checkout') {
            steps {
                // Clonar el repositorio que contiene el código fuente de la aplicación en la rama principal
                git branch: 'master', url: 'https://github.com/kev405/toolflow-frontend.git'
            }
        }

        stage('Instalar Dependencias') {
            steps {
                echo "Instalando dependencias con npm"
                sh 'npm install'
            }
        }

        stage('Construir Aplicación') {
            steps {
                echo "Construyendo la aplicación con Vite"
                sh 'npm run build'
            }
        }

        // No hay pruebas automatizadas en este caso, pero puedes descomentar y ajustar el siguiente bloque si es necesario
        // stage('Ejecutar Pruebas') {
        //     steps {
        //         echo "Ejecutando pruebas"
        //         // Ajusta el comando de pruebas según la configuración de tu proyecto
        //         sh 'npm test'
        //     }
        // }

        stage('Construir Imagen Docker') {
            steps {
                echo "Construyendo la imagen Docker para la aplicación React/Vite"
                // Se asume que tienes un Dockerfile configurado para servir la aplicación estática generada en la carpeta 'dist'
                sh 'docker build -t ${DOCKER_IMAGE}:latest .'
            }
        }

        stage('Login a DockerHub') {
            steps {
                echo "Iniciando sesión en DockerHub"
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push de Imagen Docker') {
            steps {
                echo "Subiendo la imagen Docker a DockerHub"
                sh 'docker push ${DOCKER_IMAGE}:latest'
            }
        }

        stage('Desplegar en el Host') {
            steps {
                echo "Desplegando la aplicación en el host remoto utilizando sshpass"
                withCredentials([string(credentialsId: 'ssh-password-id', variable: 'SSH_PASSWORD')]) {
                    sh '''
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} <<EOF
# Extraer la última imagen
docker pull ${DOCKER_IMAGE}:latest

# Eliminar imágenes anteriores (con tags diferentes a latest)
docker images ${DOCKER_IMAGE} --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep -v ":latest" | awk '{print $2}' | xargs -r docker rmi -f

# Detener y eliminar contenedores en ejecución (si existen)
docker stop ${APP_NAME} || true
docker rm ${APP_NAME} || true

# Iniciar un nuevo contenedor con la imagen actualizada
# Se asume que el contenedor expone el servicio en el puerto 80 y se mapea al puerto 3000 en el host
docker run -d --name ${APP_NAME} -p 3000:80 ${DOCKER_IMAGE}:latest
EOF
'''
                }
            }
        }
    }
}
