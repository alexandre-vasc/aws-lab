#!/bin/bash

export DYNAMO_TABLE=ProcessingRequest
export SQS_QUEUE_URL=

echo "update certs"
yum install -y ca-certificates
update-ca-certificates -v

echo "download node"
# Update package repositories and install Node.js
sudo yum install https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y
sudo yum install nsolid -y --nogpgcheck  

echo "node done"
yum install -y git 

# Clone the GitHub repository containing your Node.js application
git clone https://github.com/alexandre-vasc/aws-lab.git /var/www

# Navigate to the directory of your Node.js application
cd /var/www

# Install dependencies using npm (if needed)
npm install

# Start your Node.js application
node ec2.js