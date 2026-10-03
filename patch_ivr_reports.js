const fs = require('fs');
const file = 'app/admin/ivr-reports/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const logRowToReplace = `<TableCell className="text-right font-black text-amber-600">
                                                {log.credits_used ? \`-\${Math.abs(log.credits_used)}\` : '0'}
                                            </TableCell>
                                        </TableRow>`;
const newLogRow = `<TableCell className="text-right font-black text-amber-600">
                                                {log.credits_used ? \`-\${Math.abs(log.credits_used)}\` : '0'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {log.raw_payload ? (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600"><FileJson className="w-4 h-4" /></Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>Raw Webhook Payload</DialogTitle>
                                                            </DialogHeader>
                                                            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                                                                {JSON.stringify(log.raw_payload, null, 2)}
                                                            </pre>
                                                        </DialogContent>
                                                    </Dialog>
                                                ) : <span className="text-xs text-slate-400">N/A</span>}
                                            </TableCell>
                                        </TableRow>`;

content = content.replace(logRowToReplace, newLogRow);

// Fix colSpan
content = content.replace('<TableCell colSpan={6} className="text-center py-16', '<TableCell colSpan={7} className="text-center py-16');

fs.writeFileSync(file, content);
