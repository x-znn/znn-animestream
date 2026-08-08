'use client';

import { MessageCircle, Radio, X } from 'lucide-react';
import { useState } from 'react';

const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb6jzN97z4keastNq73f';

export function JoinChannelPopup() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="Gabung Saluran ZNN">
      <div className="w-full max-w-md overflow-hidden rounded-[26px] border border-white/10 bg-[#111218] shadow-[0_30px_100px_rgba(0,0,0,.65)]">
        <div className="relative overflow-hidden p-6">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#7057ff]/20 blur-3xl" />
          <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>

          <div className="relative">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7057ff] text-white shadow-[0_12px_35px_rgba(112,87,255,.3)]">
              <Radio className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-black text-white">Gabung Saluran ZNN</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">Update anime, perubahan server, dan info terbaru ZNN Animestream ada di saluran WhatsApp.</p>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white">Nanti aja</button>
              <a href={CHANNEL_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7057ff] text-sm font-black text-white transition hover:bg-[#806cff]">
                <MessageCircle className="h-4 w-4" /> Gabung
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
