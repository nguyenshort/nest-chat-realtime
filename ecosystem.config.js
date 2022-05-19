module.exports = {
  apps: [
    {
      name: 'ppe-chat-backend',
      exec_mode: 'cluster',
      instances: 'max', // Or a number of instances
      script: 'npm',
      args: 'run start:prod'
    }
  ]
}
