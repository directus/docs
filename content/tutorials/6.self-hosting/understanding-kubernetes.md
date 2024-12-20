---
id: 92776b78-2741-4ee7-96a2-bd8137b8ebc9
slug: understanding-kubernetes
title: Understanding Kubernetes
authors:
  - name: Eike Thies
    title: Guest Author
description: Learn about key Kubernetes concepts and how they interact with each other.
---
While running applications in Docker containers may not seem to complex, the reality of multi-container setups — like needing a database, secrets, hosts, backups, updates, and more — can get quite messy. This is where an orchestrator comes in.

Kubernetes (K8s) is the most popular open-source container orchestration system, and it automates deployments, scaling, and management of applications. While Kubernetes is not the easiest way to run a self-hosted Directus project, there a lot of gains to be realized.

If you never used Kubernetes, you may be surprised that you very often already have it on your development computer, so the place to test out Kubernetes itself it is very often nearby. If you want to experiment with Kubernetes for the first time, I really recommend that you do so locally.

There are a lot of hosted Kubernetes solutions for you to choose from - like Amazon's [EKS](https://aws.amazon.com/eks/), Google's [GKE](https://cloud.google.com/kubernetes-engine), and Microsoft's [AKS](https://azure.microsoft.com/en-us/products/kubernetes-service).

In this post, I walk through of some of the basic pieces of the Kubernetes puzzle, and what they mean in a Directus context. This post contains lots of small examples which are for illustrative purpose to help explain the various concepts.

## YAML and APIs

All objects can be described and created with YAML, with a minimum requirement telling which API you are going to use and what kind:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: directus
  labels:
    app: directus
spec:
  containers:
  - name: directus
    image: directus/directus:10.8.3
    ports:
      - name: http
        containerPort: 8055
        protocol: TCP
```

## Metadata and Labels

Metadata is used to identify your Kubernetes objects, with different parts of the Kubernetes puzzle requiring them to be set. Some metadata is required, with labels and annotations allowing easier object identification when searching for or targeting them.

One of the reasons is then you create an object, like a deployment, a random string is used for the pod it creates. So you to communicate with it, you need the metadata to identify it.

## Containers

Containers are the Docker images you deploy to your K8s cluster. There are mainly two kind of containers, `initContainers` and `containers`. `initContainers` runs before your containers start, like if you need to set permissions, or do some task like updating your Directus schema.

## Environment variables

Environment variables can be added as part of your object, like the URL of a Directus project.

```yaml{13-15}
apiVersion: v1
kind: Pod
metadata:
  name: directus-app
  labels:
    app: directus
spec:
  containers:
  - name: directus
    image: directus/directus:10.8.3
    ports:
      - containerPort: 80
    env:
      - name: PUBLIC_URL
        value: https://directus.app
```

## Pods

A pod is the smallest deployable compute object in K8s, like the example above. A pod is what is running one or several docker containers, a pod could be Directus, MySQL or Redis. If your pod crashes, it's dead and doesn't restart. Because of this, you need something to handle pods with, and the logic they are started, with config and volumes, there is where deployments and `StatefulSets` come in.

## Deployments

A deployment manages a set of pods to run an application workload. A deployment is a way to describe the pod(s) you want to run, if you need to mount volumes (for storing data) or config (like the config file for your Directus deployment), and add logic for resources is going to use (RAM, and CPU).

With a deployment, you create pods. Each deployment creates normally one pod (which could have many containers).

A deployment could "update" your pod - where K8s takes down the existing pod, and replaces with a new one, like when updating your Directus instance, or adding new config or environment variables.

```yaml{2}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: directus-deployment
  labels:
    app: directus
spec:
  selector:
    matchLabels:
      app: directus
  template:
    metadata:
      labels:
        app: directus
    spec:
      containers:
      - name: directus
        image: directus:10.9.3
        ports:
          - containerPort: 80
        env:
          - name: PUBLIC_URL
            value: https://directus.app
```

## `StatefulSets`

Deployments are suitable for stateless applications or microservices where instances of the application can be treated as interchangeable, and manages rolling updates and rollback strategies seamlessly, ensuring that your application remains available during updates.

For databases, you need something else, there is when you use a `StatefulSet`. These are designed for stateful applications that require stable, unique network identifiers, and persistent storage for each pod.

```yaml{2}
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: directus-mariadb
  labels:
    app: mariadb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mariadb
  serviceName: directus-mariadb
  template:
    metadata:
      labels:
        app.kubernetes.io/name: mariadb
    spec:
      containers:
        - name: mariadb
          image: mariadb:10.9.7
          ports:
            - name: mariadb
              containerPort: 3306
          volumeMounts:
            - name: data
              mountPath: /bitnami/mariadb
            - name: config
              mountPath: /opt/bitnami/mariadb/conf/my.cnf
              subPath: my.cnf
      volumes:
        - name: config
          configMap:
            name: directus-mariadb
  volumeClaimTemplates:
    - metadata:
        name: data
        labels:
          app.kubernetes.io/instance: directus
          app.kubernetes.io/name: mariadb
      spec:
        accessModes:
          - "ReadWriteOnce"
        resources:
          requests:
            storage: "8Gi"
```

## `ReplicaSets`

A replica is how many instances you should have of a pod, and is handled by `ReplicaSets`. It's good to have at least a couple of replicas if you can. If you have two replicas, the load is distributed between them, and if one of them dies, one will remain until Kubernetes starts up new pods until the number of replicas is met. You can understand replica as how many copies of the application you want have running.

An application like Directus works with replicas if you set up it with external file storage, and you are not using SQLite.

Here we are creating 3 replicas of Directus:

```yaml{8}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: directus-Deployment
  labels:
    app: directus
spec:
  replicas: 3
  selector:
    matchLabels:
      app: directus
  template:
    metadata:
      labels:
        app: directus
    spec:
      containers:
      - name: directus
        image: directus:10.9.3
        ports:
          - containerPort: 80
```

## Volumes and `StorageClasses`

As you could see in the MariaDB `StatefulSet` above, we are mounting volumes. These can be temporarily, like a `temp` directory, or they could be persistent between deployments.

A persistent volume needs a `StorageClass`. A `StorageClass` normally has the type `ReadWriteOnce` - which means it only could be written to by one pod (but all of the containers in the pod). Another type of `StorageClass` could use `ReadWriteMany` - and that is useful if you have many pods that needs to write to the same filesystem - like uploading files. I recommend never setting up a database with a `ReadWriteMany` `StorageClass`.

Here is an example of a Deployment with an `emptyDir` (`/tmp`) - a non-persistent volume (when the pod restarts, it is empty again.)

```yaml{27-29}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: directus-Deployment
  labels:
    app: directus
spec:
  selector:
    matchLabels:
      app: directus
  template:
    metadata:
      labels:
        app: directus
    spec:
      containers:
      - name: directus
        image: directus/directus:10.9.3
        ports:
          - containerPort: 80
        env:
          - name: PUBLIC_URL
            value: https://directus.app
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
```

## `ConfigMaps`

`ConfigMaps` are used to store different kind of configuration objects like environment variables or a file-based configuration, which later could be used to mount (like a volume), for an application to use.

Like config for MariaDB:

```yaml{2}
apiVersion: v1
kind: ConfigMap
metadata:
  name: release-name-mariadb
  labels:
    app: mariadb
data:
  my.cnf: |-
    [mysqld]
    skip-name-resolve
    max_allowed_packet=16M
```

And then mounted:

```yaml
[...]
          volumeMounts:
            - name: config
              mountPath: /opt/bitnami/mariadb/conf/my.cnf
              subPath: my.cnf
      volumes:
        - name: config
          configMap:
            name: release-name-mariadb
[...]
```

This means that you can mount your config to a Docker container, so the container could be clean, without your projects config.

## Services

Services are used to expose the running pods, so you could communicate between the pods or expose them in different ways. The Docker port is not exposed by default so, for example, Directus would not be able to find MariaDB. There are different kind of Services, and here we only going to cover the most common one, `ClusterIP`, which gives a service an internal IP address so communication can happen between them.

Example service for the MariaDB `StatefulSet` could be:

```yaml{9}
apiVersion: v1
kind: Service
metadata:
  name: directus-mariadb
  labels:
    app: mariadb
  annotations:
spec:
  type: ClusterIP
  ports:
    - name: mysql
      port: 3306
      protocol: TCP
      targetPort: mysql
  selector:
    labels:
      app.kubernetes.io/name: mariadb
```

This finds the MariaDB StatefulSet (the selector part, looks for a label named `app.kubernetes.io/name`, and value `mariadb`), and exposes port 3306 with the name `directus-mariadb` (equals hostname) for the running pod.

In Directus, you can communicate with the MariaDB pod, setting the port and the hostname as environment variables in the Deployment:

```yaml
env:
  - name: DB_PORT
    value: "3306"
  - name: DB_HOST
    value: directus-mariadb
```

## Ingresses

Ingresses exposes the service (which exposes the pod) to "the world". Ingresses exists of different kinds, and one of the most common ones is Nginx Ingress. If we want someone to reach our Directus app outside of the cluster, we need an ingress, but first we need a service to expose our Directus app:

```yaml{2}
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/instance: directus
    app.kubernetes.io/name: directus
  name: directus
spec:
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8055
  selector:
    labels:
      app: directus
  type: ClusterIP
```

So, now can use the name of the Service, `directus` in the ingress, like:

```yaml{14-17}
apiVersion: networking.K8s.io/v1
kind: Ingress
metadata:
  labels:
    app.kubernetes.io/instance: directus
    app.kubernetes.io/name: directus
  name: directus
spec:
  rules:
  - host: directus.app
    http:
      paths:
      - backend:
          service:
            name: directus
            port:
              number: 80
        path: /
        pathType: ImplementationSpecific
```

So, if we create a DNS-record for `directus.app`, pointing to your K8s cluster, the user would end up in our Directus app.

## Summary

With this, you have learned how you could orchestrate your containers, your volumes, config, secrets, and more with Kubernetes. We've also covered some of the common terminology needed to fully understand a Kubernetes setup.
