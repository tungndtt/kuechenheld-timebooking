cd .k8s

kubectl apply -f pubsub-deployment.yml

kubectl apply -f database-config.yml
kubectl apply -f database-deployment.yml

kubectl apply -f backend-config.yml
kubectl apply -f backend-deployment.yml

kubectl apply -f frontend-config.yml
kubectl apply -f frontend-deployment.yml

kubectl apply -f proxy-config.yml
kubectl apply -f proxy-deployment.yml

kubectl port-forward service/proxy-service 8080:8080
