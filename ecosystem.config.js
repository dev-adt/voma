// PM2 Ecosystem Config
// Chạy: pm2 start ecosystem.config.js
// Xem log: pm2 logs voma-ai
// Reload: pm2 reload voma-ai
// Auto-start khi reboot: pm2 startup && pm2 save

module.exports = {
  apps: [
    {
      name        : 'voma-ai',
      script      : 'server.js',
      instances   : 1,           // tăng lên 'max' nếu muốn cluster
      exec_mode   : 'fork',
      watch       : false,
      max_memory_restart: '300M',

      env: {
        NODE_ENV : 'production',
        PORT     : 3010,
      },

      // Log
      out_file    : './logs/out.log',
      error_file  : './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Auto restart nếu crash
      autorestart : true,
      restart_delay: 3000,
    },
  ],
};
