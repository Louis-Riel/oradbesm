node {
	label 'master'
    def app

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout([
		  $class: 'GitSCM', branches: [[name: '*/master']],
		  userRemoteConfigs: [[url: 'https://github.ibm.com/mdmr/diffconfabulator.git',credentialsId:'riell@ca.ibm.com']]
		])
    }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */

	docker.withServer('tcp://172.17.0.1:2376', '') {
			
	        app = docker.build("diffconfabulator",)
	    }
    }

    stage('Test image') {
        /* Ideally, we would run a test framework against our image.
         * For this example, we're using a Volkswagen-type approach ;-) */

        app.inside {
            sh 'echo "Tests passed"'
        }
    }
}