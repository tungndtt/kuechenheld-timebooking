cd .k8s

kubectl delete -f pubsub-deployment.yml

kubectl delete -f database-config.yml
kubectl delete -f database-deployment.yml

kubectl delete -f backend-config.yml
kubectl delete -f backend-deployment.yml

kubectl delete -f frontend-config.yml
kubectl delete -f frontend-deployment.yml

kubectl delete -f proxy-config.yml
kubectl delete -f proxy-deployment.yml