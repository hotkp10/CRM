"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileJson, RefreshCcw, Activity } from "lucide-react"

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" /> Webhook Debugger
          </h1>
          <p className="text-slate-500">Live feed of incoming webhook payloads from Ozonetel.</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Time</TableHead>
                  <TableHead className="font-bold">Endpoint</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold text-right">Raw Payload</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                      No webhook logs found. Make a test call in Ozonetel to see data here.
                    </TableCell>
                  </TableRow>
                )}
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm font-medium text-slate-700 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">{log.endpoint}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.method === 'POST' ? 'default' : 'outline'} className="text-xs">
                        {log.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-indigo-600">
                            <FileJson className="w-4 h-4 mr-2" /> View JSON
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Webhook Payload Details</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto mt-4 bg-slate-950 p-4 rounded-md">
                            <pre className="text-emerald-400 text-xs font-mono whitespace-pre-wrap break-all">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
