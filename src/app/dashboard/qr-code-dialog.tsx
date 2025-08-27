
"use client"

import React from 'react'
import QRCode from "qrcode.react"
import { Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Asset } from "@/lib/types"

interface QrCodeDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  asset: Asset
}

export function QrCodeDialog({ isOpen, setIsOpen, asset }: QrCodeDialogProps) {
  const qrCodeValue = JSON.stringify({ assetTag: asset.assetTag, name: asset.name });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md print:border-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Asset QR Code Label</DialogTitle>
          <DialogDescription>
            Print this label and attach it to the asset for easy scanning.
          </DialogDescription>
        </DialogHeader>
        <div id="print-area" className="label-container flex justify-center p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 print:border-2 print:border-black print:rounded-none">
            <div className="space-y-2 text-center text-black">
                <div className="logo flex items-center justify-center gap-2 font-bold text-base">
                    <Wind className="h-5 w-5" />
                    <span>Kite Assets</span>
                </div>
                <div className="p-2 bg-white inline-block">
                    <QRCode value={qrCodeValue} size={128} level="H" />
                </div>
                <h3 className="font-bold text-lg pt-2 asset-name">{asset.name}</h3>
                <p className="text-sm text-neutral-600 asset-tag">{asset.assetTag}</p>
            </div>
        </div>
        <div className="flex justify-end mt-4 print:hidden">
          <Button onClick={handlePrint}>Print Label</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
