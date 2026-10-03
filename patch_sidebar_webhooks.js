const fs = require('fs');
const file = 'config/sidebar-nav.ts';
let content = fs.readFileSync(file, 'utf8');

const importTarget = 'import { \n  LayoutDashboard, ';
if (!content.includes('WebhookIcon')) {
  content = content.replace('import { \n  LayoutDashboard, ', 'import { \n  LayoutDashboard, Webhook as WebhookIcon, ');
}

const navTarget = '{ name: "Automations", href: "/admin/automations", icon: Zap, module: "core" },';
const newNav = '{ name: "Automations", href: "/admin/automations", icon: Zap, module: "core" },\n      { name: "Webhook Debugger", href: "/admin/webhook-logs", icon: WebhookIcon, module: "core" },';

content = content.replace(navTarget, newNav);
fs.writeFileSync(file, content);
