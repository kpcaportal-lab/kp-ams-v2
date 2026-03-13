'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Proposal } from '@/types';

import api from '@/lib/api';

interface ProposalDownloadButtonProps {
  proposal: Proposal;
  variant?: 'icon' | 'full';
  className?: string;
}

export function ProposalDownloadButton({ proposal, variant = 'icon', className }: ProposalDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = toast.loading('Downloading proposal PDF...');
    setIsDownloading(true);
    try {
      const response = await api.get(`/api/proposals/${proposal.id}/export/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileName = `Proposal_${proposal.number?.replace(/\//g, '_') || proposal.id}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Proposal downloaded successfully', { id: toastId });
    } catch (error: any) {
      console.error('PDF Download Error:', error);
      toast.error(error.message || 'Failed to download PDF', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      className={className}
      onClick={handleDownload}
      disabled={isDownloading}
      title="Download Proposal PDF"
    >
      {isDownloading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
      ) : (
        variant === 'icon' ? <Download /> : 'Download Proposal PDF'
      )}
    </button>
  );
}
