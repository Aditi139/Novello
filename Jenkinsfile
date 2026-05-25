pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-docker-registry'   // Replace with your Docker Hub username or registry
        IMAGE_TAG = "${BUILD_NUMBER}"
        RAZORPAY_KEY_ID = credentials('razorpay-key-id')
        RAZORPAY_KEY_SECRET = credentials('razorpay-key-secret')
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk-amd64'
    }

    tools {
        maven 'Maven-3.9'
        jdk 'JDK-17'
        nodejs 'Node-20'
    }

    stages {

        stage('📥 Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-org/novello.git'
                echo '✅ Source code checked out'
            }
        }

        stage('🔨 Build Backend Services') {
            parallel {
                stage('User Service') {
                    steps {
                        dir('user-service') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
                stage('Catalog Service') {
                    steps {
                        dir('catalog-service') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
                stage('Order Service') {
                    steps {
                        dir('order-service') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
                stage('Payment Service') {
                    steps {
                        dir('payment-service') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
                stage('Inventory Service') {
                    steps {
                        dir('inventory-service') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
                stage('eBook Service') {
                    steps {
                        dir('ebook-service') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
                stage('Notification Service') {
                    steps {
                        dir('notification-service') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            sh 'mvn clean compile -q'
                        }
                    }
                }
            }
        }

        stage('🧪 Test') {
            parallel {
                stage('Test User Service') {
                    steps {
                        dir('user-service') {
                            sh 'mvn test'
                            junit 'target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Test Catalog Service') {
                    steps {
                        dir('catalog-service') {
                            sh 'mvn test'
                            junit 'target/surefire-reports/*.xml'
                        }
                    }
                }
            }
        }

        stage('📦 Package') {
            parallel {
                stage('Package User Service') {
                    steps { dir('user-service') { sh 'mvn package -DskipTests -q' } }
                }
                stage('Package Catalog Service') {
                    steps { dir('catalog-service') { sh 'mvn package -DskipTests -q' } }
                }
                stage('Package Order Service') {
                    steps { dir('order-service') { sh 'mvn package -DskipTests -q' } }
                }
                stage('Package Payment Service') {
                    steps { dir('payment-service') { sh 'mvn package -DskipTests -q' } }
                }
                stage('Package Inventory Service') {
                    steps { dir('inventory-service') { sh 'mvn package -DskipTests -q' } }
                }
                stage('Package eBook Service') {
                    steps { dir('ebook-service') { sh 'mvn package -DskipTests -q' } }
                }
                stage('Package Notification Service') {
                    steps { dir('notification-service') { sh 'mvn package -DskipTests -q' } }
                }
                stage('Package API Gateway') {
                    steps { dir('api-gateway') { sh 'mvn package -DskipTests -q' } }
                }
            }
        }

        stage('🎨 Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('🐳 Docker Build & Push') {
            steps {
                script {
                    def services = ['user-service', 'catalog-service', 'order-service',
                                    'payment-service', 'inventory-service', 'ebook-service',
                                    'notification-service', 'api-gateway', 'frontend']

                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                        services.each { svc ->
                            sh """
                                docker build -t ${DOCKER_REGISTRY}/novello-${svc}:${IMAGE_TAG} ./${svc}
                                docker push ${DOCKER_REGISTRY}/novello-${svc}:${IMAGE_TAG}
                                docker tag ${DOCKER_REGISTRY}/novello-${svc}:${IMAGE_TAG} ${DOCKER_REGISTRY}/novello-${svc}:latest
                                docker push ${DOCKER_REGISTRY}/novello-${svc}:latest
                            """
                            echo "✅ Pushed ${svc} image"
                        }
                    }
                }
            }
        }

        stage('🚀 Deploy') {
            steps {
                script {
                    sh """
                        export IMAGE_TAG=${IMAGE_TAG}
                        export RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
                        export RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
                        docker compose pull
                        docker compose up -d --remove-orphans
                    """
                    echo '✅ All services deployed successfully!'
                }
            }
        }

        stage('🔍 Health Check') {
            steps {
                script {
                    sleep(30)
                    def endpoints = [
                        'user-service': 'http://localhost:8081/actuator/health',
                        'catalog-service': 'http://localhost:8082/actuator/health',
                        'order-service': 'http://localhost:8083/actuator/health',
                        'payment-service': 'http://localhost:8084/actuator/health',
                        'api-gateway': 'http://localhost:8080/actuator/health'
                    ]
                    endpoints.each { name, url ->
                        def response = sh(script: "curl -s -o /dev/null -w '%{http_code}' ${url}", returnStdout: true).trim()
                        if (response != '200') {
                            error("❌ ${name} health check failed! HTTP ${response}")
                        }
                        echo "✅ ${name} is healthy"
                    }
                }
            }
        }
    }

    post {
        success {
            echo '''
            ╔══════════════════════════════════════╗
            ║  ✅ NOVELLO DEPLOYMENT SUCCESSFUL!   ║
            ║  All services are up and running     ║
            ╚══════════════════════════════════════╝
            '''
        }
        failure {
            echo '''
            ╔══════════════════════════════════════╗
            ║  ❌ NOVELLO DEPLOYMENT FAILED!       ║
            ║  Check logs for details              ║
            ╚══════════════════════════════════════╝
            '''
            // mail to: 'devops@novello.com', subject: "FAILED: Novello Build ${BUILD_NUMBER}", body: "Check ${BUILD_URL} for details."
        }
        always {
            cleanWs()
        }
    }
}
