pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/hajarsosso/mon_projet.git',
                    credentialsId: 'github-token'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'sudo apt update'
                sh 'sudo apt install python3-pip -y'
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
                sh 'sudo docker build -t calculator-app .'
            }
        }
        
        stage('Docker Test') {
            steps {
                sh 'sudo docker run calculator-app'
            }
        }
    }
    
    post {
        success {
            echo ' Pipeline successful!'
        }
        failure {
            echo ' Pipeline failed!'
        }
    }
}

