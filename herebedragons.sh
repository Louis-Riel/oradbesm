#!/bin/bash

curl --header "Content-Type: application/json" --request PUT --data "{\"operation\":{\"query\":\"select * from some_data\",\"oraConnStr\":{\"connectString\":\"$(hostname):1521/ORCLCDB.localdomain\",\"password\":\"dummy\",\"user\":\"dummy\"}}}" http://localhost:8009