'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export function PrintButton({ studentName, examTitle }: { studentName: string, examTitle: string }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      // Import dinámicamente para no bloquear la carga inicial con bibliotecas pesadas de PDF
      const htmlToImage = await import('html-to-image')
      const jsPDF = (await import('jspdf')).default

      const element = document.getElementById('pdf-content-wrapper')
      if (!element) throw new Error("No se encontró el contenedor principal del PDF")

      // Preparamos los elementos a ocultar para impresión
      const hiddenElements = element.querySelectorAll('.print\\:hidden') as NodeListOf<HTMLElement>
      hiddenElements.forEach(el => el.style.display = 'none')

      const imgData = await htmlToImage.toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2
      })

      // Generar un canvas temporal para obtener el ancho y alto real resultante
      const img = new Image()
      img.src = imgData
      await new Promise((resolve) => { img.onload = resolve })

      const canvasWidth = img.width
      const canvasHeight = img.height

      // Restauramos los elementos ocultos
      hiddenElements.forEach(el => el.style.display = '')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const margin = 10 
      const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2)
      const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      let heightLeft = pdfHeight
      let position = margin

      // Añadimos primera página
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight)
      heightLeft -= (pageHeight - margin * 2)

      // Añadimos páginas adicionales si el contenido es largo
      while (heightLeft > 0) {
        position = position - (pageHeight - margin * 2)
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight)
        heightLeft -= (pageHeight - margin * 2)
      }

      const safeName = `${studentName}_${examTitle}`.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      pdf.save(`resultados_${safeName}.pdf`)

    } catch (error: any) {
      console.error('Error al generar PDF', error)
      alert(`Hubo un error al generar el documento PDF: ${error?.message || 'Error desconocido'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="gap-2 print:hidden" 
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
    </Button>
  )
}
