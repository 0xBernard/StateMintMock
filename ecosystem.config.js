module.exports = {
  apps: [{
    name: 'statemint-app',
    script: 'node',
    args: 'server.js', // Use standalone server directly instead of npm start
    cwd: '.next/standalone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M', // Restart before hitting memory limits
    exp_backoff_restart_delay: 100, // Exponential backoff on crashes
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Limit Node.js heap size - critical for small servers
      NODE_OPTIONS: '--max-old-space-size=384 --gc-interval=100'
    }
  }]
} 