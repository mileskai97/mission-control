#!/bin/bash
# mc.sh — Mission Control CLI wrapper
# Usage: mc.sh <command> [args]
CONVEX_DIR="/Users/milesk/.openclaw/workspace/mission-control"

case "$1" in
  tasks)        cd "$CONVEX_DIR" && npx convex run tasks:list ;;
  task)         cd "$CONVEX_DIR" && npx convex run tasks:get "{\"id\":\"$2\"}" ;;
  my-tasks)     cd "$CONVEX_DIR" && npx convex run tasks:getByStatus "{\"status\":\"$2\"}" ;;
  create-task)  cd "$CONVEX_DIR" && npx convex run tasks:create "$2" ;;
  update-task)  cd "$CONVEX_DIR" && npx convex run tasks:update "$2" ;;
  comment)      cd "$CONVEX_DIR" && npx convex run messages:create "$2" ;;
  comments)     cd "$CONVEX_DIR" && npx convex run messages:listByTask "{\"taskId\":\"$2\"}" ;;
  notify)       cd "$CONVEX_DIR" && npx convex run notifications:getForAgent "{\"agentId\":\"$2\"}" ;;
  activity)     cd "$CONVEX_DIR" && npx convex run activities:list "{\"limit\":${2:-20}}" ;;
  doc)          cd "$CONVEX_DIR" && npx convex run documents:create "$2" ;;
  agents)       cd "$CONVEX_DIR" && npx convex run agents:list ;;
  heartbeat)    cd "$CONVEX_DIR" && npx convex run agents:heartbeat "{\"id\":\"$2\"}" ;;
  status)       cd "$CONVEX_DIR" && npx convex run agents:updateStatus "$2" ;;
  *)
    echo "Mission Control CLI"
    echo "  tasks                  List all tasks"
    echo "  task <id>              Get task details"
    echo "  my-tasks <status>      Get tasks by status"
    echo "  create-task '{...}'    Create task"
    echo "  update-task '{...}'    Update task"
    echo "  comment '{...}'        Post comment on task"
    echo "  comments <taskId>      List comments on task"
    echo "  notify <agentId>       Check notifications"
    echo "  activity [limit]       Recent activity"
    echo "  doc '{...}'            Create document"
    echo "  agents                 List all agents"
    echo "  heartbeat <agentId>    Record heartbeat"
    echo "  status '{...}'         Update agent status"
    ;;
esac
