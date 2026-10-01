"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Phone, Plus, Trash2, Power, Building2, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { LoadingSkeleton } from "@/components/loading-skeleton"

export default function DIDRegistryPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [dids, setDids] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ tenant_id: "", did_number: "", label: "", is_active: true })
  
  const [isToggling, setIsToggling] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: orgs } = await supabase.from('organizations').select('id, name').order('name')
    if (orgs) setOrganizations(orgs)
    
    const { data: didRecords } = await supabase.from('tenant_did_registry').select('*').order('created_at', { ascending: false })
    if (didRecords) setDids(didRecords)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddDid = async () => {
    if (!formData.tenant_id || !formData.did_number) {
      return toast.error("Tenant and DID Number are required")
    }

    const cleanedNumber = formData.did_number.replace(/\D/g, '').slice(-10)
    if (cleanedNumber.length !== 10) {
      return toast.error("DID must be 10 digits")
    }

    setIsSubmitting(true)
    const { error } = await supabase.from('tenant_did_registry').insert({
      tenant_id: formData.tenant_id,
      did_number: cleanedNumber,
      label: formData.label,
      is_active: formData.is_active
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("DID added successfully")
      setShowModal(false)
      setFormData({ tenant_id: "", did_number: "", label: "", is_active: true })
      fetchData()
    }
    setIsSubmitting(false)
  }

  const handleToggle = async (record: any) => {
    setIsToggling(record.id)
    const { error } = await supabase.from('tenant_did_registry').update({ is_active: !record.is_active }).eq('id', record.id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`DID marked ${!record.is_active ? 'Active' : 'Inactive'}`)
      fetchData()
    }
    setIsToggling(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this DID?")) return
    setIsDeleting(id)
    const { error } = await supabase.from('tenant_did_registry').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("DID deleted successfully")
      fetchData()
    }
    setIsDeleting(null)
  }

  if (loading) return <LoadingSkeleton variant="dashboard" />

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            DID Registry
          </h1>
          <p className="text-slate-500 mt-1">Assign Ozonetel DID numbers to tenants for secure IVR routing</p>
        </div>
        <div>
          <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Add DID
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DID Number</TableHead>
                <TableHead>Tenant Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dids.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No DIDs found.
                  </TableCell>
                </TableRow>
              ) : (
                dids.map(did => {
                  const org = organizations.find(o => o.id === did.tenant_id)
                  return (
                    <TableRow key={did.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {did.did_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {org?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>{did.label || '-'}</TableCell>
                      <TableCell>
                        {did.is_active ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(did.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggle(did)}
                            disabled={isToggling === did.id}
                            title={did.is_active ? "Deactivate" : "Activate"}
                          >
                            {isToggling === did.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : (
                              <Power className={`h-4 w-4 ${did.is_active ? 'text-red-500' : 'text-green-500'}`} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(did.id)}
                            disabled={isDeleting === did.id}
                            title="Delete"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {isDeleting === did.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-indigo-600" /> Add DID Number
            </DialogTitle>
            <DialogDescription>
              Map a new DID to a tenant for automatic webhook routing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tenant <span className="text-red-500">*</span></Label>
              <Select value={formData.tenant_id} onValueChange={v => setFormData({...formData, tenant_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select a tenant..." /></SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>DID Number <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="e.g. 9876543210" 
                value={formData.did_number} 
                onChange={e => setFormData({...formData, did_number: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Label (Optional)</Label>
              <Input 
                placeholder="e.g. Main IVR Line" 
                value={formData.label} 
                onChange={e => setFormData({...formData, label: e.target.value})} 
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Label className="flex flex-col">
                <span>Active Status</span>
                <span className="text-xs text-slate-500 font-normal">Is this DID currently routing calls?</span>
              </Label>
              <Switch 
                checked={formData.is_active} 
                onCheckedChange={v => setFormData({...formData, is_active: v})} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddDid} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Save DID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
