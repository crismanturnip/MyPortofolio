module.exports = {
  apps: [
    {
      name: "crismancode",
      cwd: "/var/www/crismancode",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        LOCAL_UPLOAD_DIR: "/var/www/crismancode/shared/uploads",
      },
    },
  ],
};
