"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Phone, FileText, CheckCircle, AlertCircle, Loader2, History, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import Papa from "papaparse"
import { createClient } from "@/lib/supabase/client"
import { submitIvrUploadRequest } from "@/app/actions/ivr-upload-action"

export default function IvrUploadPage() {
  const [tenantId, setTenantId] = useState<string>("")
  const [dids, setDids] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loadingInitial, setLoadingInitial] = useState(true)

  const [campaignName, setCampaignName] = useState("")
  const [selectedDidId, setSelectedDidId] = useState("")
  const [inputMethod, setInputMethod] = useState<"csv" | "paste">("csv")
  const [rawText, setRawText] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [validPhones, setValidPhones] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (inputMethod === 'paste') {
      const phones = rawText.split('\n')
        .map(p => p.replace(/\D/g, ''))
        .filter(p => p.length === 10)
      setValidPhones(Array.from(new Set(phones)))
    }
  }, [rawText, inputMethod])

  const fetchInitialData = async () => {
    setLoadingInitial(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
      if (profile) {
        setTenantId(profile.tenant_id)
        
        const { data: didData } = await supabase.from('tenant_did_registry')
          .select('id, did_number, label')
          .eq('tenant_id', profile.tenant_id)
          .eq('is_active', true)
        setDids(didData || [])

        fetchHistory(profile.tenant_id)
      }
    }
    setLoadingInitial(false)
  }

  const fetchHistory = async (tId: string) => {
    const { data } = await supabase.from('ivr_upload_requests')
      .select('*')
      .eq('tenant_id', tId)
      .order('created_at', { ascending: false })
      .limit(20)
    setHistory(data || [])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFile(file)
    Papa.parse(file, {
      complete: (results) => {
        const phones: string[] = []
        results.data.forEach((row: any) => {
          if (row && row[0]) {
            const clean = String(row[0]).replace(/\D/g, '')
            if (clean.length === 10) {
              phones.push(clean)
            }
          }
        })
        setValidPhones(Array.from(new Set(phones)))
      }
    })
  }

  const handleSubmit = async () => {
    if (!campaignName) return toast.error("Campaign Name is required")
    if (!selectedDidId) return toast.error("Please select a DID")
    if (validPhones.length === 0) return toast.error("No valid 10-digit phone numbers found")

    setIsSubmitting(true)
    try {
      const did = dids.find(d => d.id === selectedDidId)
      const res = await submitIvrUploadRequest({
        campaignName,
        didNumber: did?.did_number || '',
        didLabel: did?.label || '',
        phoneNumbers: validPhones,
        notes
      })
      if (res.success) {
        toast.success("IVR Upload Request submitted successfully")
        setCampaignName("")
        setRawText("")
        setCsvFile(null)
        setValidPhones([])
        setNotes("")
        fetchHistory(tenantId)
      } else {
        toast.error(res.error || "Failed to submit request")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
    setIsSubmitting(false)
  }

  if (loadingInitial) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <UploadCloud className="h-8 w-8 text-indigo-600" /> 
          IVR Lead Upload
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Upload contact lists for IVR campaigns to be processed by our team.</p>
      </div>

      {dids.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="font-semibold text-sm">No DIDs assigned to your account. Please contact Hanva support.</p>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardContent className="p-6 space-y-6 mt-2">
          
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Campaign Name <span className="text-rose-500">*</span></Label>
            <Input placeholder="e.g. Summer Promo 2026" value={campaignName} onChange={e => setCampaignName(e.target.value)} className="bg-slate-50 border-slate-200 focus:ring-indigo-500 rounded-xl h-11" />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Select DID <span className="text-rose-500">*</span></Label>
            <Select value={selectedDidId} onValueChange={setSelectedDidId}>
              <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500 rounded-xl h-11">
                <SelectValue placeholder="Choose DID..." />
              </SelectTrigger>
              <SelectContent>
                {dids.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.did_number} {d.label ? `(${d.label})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Input Method</Label>
            <div className="flex gap-4 mb-2">
              <Button type="button" variant={inputMethod === 'csv' ? 'default' : 'outline'} className={inputMethod === 'csv' ? 'bg-indigo-600' : ''} onClick={() => { setInputMethod('csv'); setValidPhones([]) }}>
                Upload CSV
              </Button>
              <Button type="button" variant={inputMethod === 'paste' ? 'default' : 'outline'} className={inputMethod === 'paste' ? 'bg-indigo-600' : ''} onClick={() => { setInputMethod('paste'); setValidPhones([]) }}>
                Paste Numbers
              </Button>
            </div>
            
            {inputMethod === 'csv' && (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs mx-auto" />
                <p className="text-xs text-slate-500 mt-3">First column will be parsed as phone numbers.</p>
              </div>
            )}
            
            {inputMethod === 'paste' && (
              <Textarea 
                placeholder="Paste numbers here, one per line..." 
                className="min-h-[150px] bg-slate-50 rounded-xl border-slate-200" 
                value={rawText} 
                onChange={e => setRawText(e.target.value)} 
              />
            )}
            
            {validPhones.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <CheckCircle className="w-5 h-5" /> Found {validPhones.length.toLocaleString()} valid 10-digit numbers.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Notes (Optional)</Label>
            <Textarea placeholder="Any instructions for the support team..." value={notes} onChange={e => setNotes(e.target.value)} className="bg-slate-50 border-slate-200 rounded-xl" />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting || dids.length === 0} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-semibold">
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
            {isSubmitting ? 'Submitting...' : 'Submit Upload Request'}
          </Button>

        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden mt-8">
        <CardHeader className="bg-white border-b py-4">
          <CardTitle className="text-lg text-slate-800 font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" /> Recent Upload Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Campaign Name</TableHead>
                <TableHead className="font-bold">DID</TableHead>
                <TableHead className="text-center font-bold">Contacts</TableHead>
                <TableHead className="text-right font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(h => (
                <TableRow key={h.id}>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(h.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="font-bold text-sm text-slate-800">{h.campaign_name}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-600">{h.did_number}</TableCell>
                  <TableCell className="text-center text-sm font-mono text-indigo-600 font-bold">{h.total_contacts}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={h.status === 'pending' ? 'secondary' : 'default'} className="text-[10px] uppercase font-bold px-2 py-0.5">
                      {h.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-slate-500">No requests found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}
