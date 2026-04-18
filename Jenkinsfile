pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/YOUR_USERNAME/mon_projet.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'pip3 install pytest flask'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'python3 -m pytest tests/ -v'
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker build -t calculator-app .'
            }
        }
        
        stage('Docker Test') {
            steps {
                sh 'docker run calculator-app'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
