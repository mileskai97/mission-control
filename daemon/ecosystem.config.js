module.exports = {
  apps: [{
    name: "mc-notify",
    script: "./daemon/notify.js",
    cwd: "/Users/milesk/.openclaw/workspace/mission-control",
    env: {
      CONVEX_URL: "https://wonderful-oriole-632.convex.cloud",
    },
    restart_delay: 5000,
    max_restarts: 10,
  }]
};
