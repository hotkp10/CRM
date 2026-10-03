const fs = require('fs');
const file = 'config/sidebar-nav.ts';
let content = fs.readFileSync(file, 'utf8');

const navTarget = '{ name: "Automations", href: "/admin/automations", icon: Zap, module: "core" },\n      { name: "Webhook Debugger", href: "/admin/webhook-logs", icon: WebhookIcon, module: "core" },';
const oldNav = '{ name: "Automations", href: "/admin/automations", icon: Zap, module: "core" },';

content = content.replace(navTarget, oldNav);

// Remove WebhookIcon if it's there
content = content.replace('LayoutDashboard, Webhook as WebhookIcon, ', 'LayoutDashboard, ');

fs.writeFileSync(file, content);
