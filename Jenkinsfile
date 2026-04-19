pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/hajarsosso/mon_projet.git'
            }
        }
        
        stage('Check Files') {
            steps {
                sh 'ls -la'
                sh 'test -f index.html && echo "✅ index.html found" || echo "❌ index.html missing"'
                sh 'test -f css/style.css && echo "✅ style.css found" || echo "❌ style.css missing"'
                sh 'test -f js/index.js && echo "✅ index.js found" || echo "❌ index.js missing"'
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker build -t habit-tracker .'
            }
        }
        
        stage('Docker Run') {
            steps {
                sh 'docker stop habit-tracker || true'
                sh 'docker rm habit-tracker || true'
                sh 'docker run -d -p 8081:80 --name habit-tracker habit-tracker'
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline successful! Your Habit Tracker is live on port 8081!'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
    }
}
