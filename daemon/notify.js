const { ConvexHttpClient } = require("convex/browser");
const { execSync } = require("child_process");

const client = new ConvexHttpClient(process.env.CONVEX_URL);

const AGENT_SESSIONS = {
  "Mileskai": "agent:main:main",
  "Rex": "agent:ios-engineer:main",
  "Renzo": "agent:code-reviewer:main",
  "Sierra": "agent:growth-officer:main",
};

async function deliverNotifications() {
  const { api } = require("../convex/_generated/api");
  const undelivered = await client.query(api.notifications.getUndelivered);

  for (const notification of undelivered) {
    const agent = await client.query(api.agents.get, { id: notification.mentionedAgentId });
    if (!agent) continue;

    const sessionKey = AGENT_SESSIONS[agent.name];
    if (!sessionKey) continue;

    try {
      const msg = notification.content.replace(/"/g, '\\"').replace(/\n/g, ' ');
      execSync(
        `openclaw sessions send --session "${sessionKey}" --message "${msg}"`,
        { timeout: 10000 }
      );
      await client.mutation(api.notifications.markDelivered, { id: notification._id });
      console.log(`✅ Delivered to ${agent.name}: ${notification.content.substring(0, 50)}...`);
    } catch (e) {
      console.log(`⏳ ${agent.name} queued: ${notification.content.substring(0, 50)}...`);
    }
  }
}

async function main() {
  console.log("🔔 Notification daemon started");
  console.log(`📡 Connected to: ${process.env.CONVEX_URL}`);
  while (true) {
    try {
      await deliverNotifications();
    } catch (e) {
      console.error("Error:", e.message);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main();
