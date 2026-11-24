// Démonstration Copilot : examiner un appel d'outil avant son exécution.
// Node.js uniquement, sans paquet supplémentaire.
const fs = require('node:fs');

function deny(reason) {
  process.stdout.write(JSON.stringify({
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  }));
}

try {
  const event = JSON.parse(fs.readFileSync(0, 'utf8'));
  const toolName = event.toolName ?? event.tool_name;
  let args = event.toolArgs ?? event.tool_input ?? event.toolInput;
  if (typeof toolName !== 'string' || args == null) {
    throw new Error('Événement attendu : toolName et toolArgs.');
  }
  // Certains outils transmettent leurs arguments sous forme de JSON encodé.
  if (typeof args === 'string') {
    try { args = JSON.parse(args); } catch { /* Commande en texte brut. */ }
  }
  const text = typeof args === 'string' ? args : JSON.stringify(args);
  const mentionsProtectedFile = /(^|[^a-z0-9_.-])demo-protected\.txt($|[^a-z0-9_.-])/i.test(text);
  const isShell = /bash|powershell|terminal|shell|run.*command/i.test(toolName);
  const hasDeleteCommand = /\b(rm|unlink|del|erase|remove-item)\b/i.test(text);
  const isDeleteTool = /delete|remove.*file/i.test(toolName);
  const hasDeletePatch = /\*\*\* Delete File:[^\r\n]*demo-protected\.txt/i.test(text);

  if (mentionsProtectedFile && (
    (isShell && hasDeleteCommand) || isDeleteTool || hasDeletePatch
  )) {
    deny('Démonstration Tool Guardian : suppression de demo-protected.txt interdite. Conserve ce fichier et explique le blocage à l’utilisateur.');
  } else {
    // Aucune décision : les permissions habituelles continuent à s'appliquer.
    process.stdout.write('{}');
  }
} catch (error) {
  deny(`Tool Guardian : événement illisible ou incomplet (${error.message}). Vérifie la configuration du hook.`);
}
