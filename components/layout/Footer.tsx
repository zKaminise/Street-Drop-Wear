import Link from 'next/link'
import { Instagram, MessageCircle, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import { getWhatsAppLink, INSTAGRAM_URL, TIKTOK_URL, EMAIL, PHONE_DISPLAY } from '@/lib/utils'

const FOOTER_LINKS = {
  shop: [
    { label: '🔥 Flash Sale', href: '/flash-sale' },
    { label: 'Oversized', href: '/oversized' },
    { label: 'Camisetas Normais', href: '/camisetas' },
    { label: 'DryFit Fitness', href: '/dryfit' },
    { label: 'Produtos 3D', href: '/produtos-3d' },
    { label: 'Geek Store', href: '/geek' },
  ],
  kits: [
    { label: 'Kit Empresa', href: '/kits' },
    { label: 'Kit Academia', href: '/kits' },
    { label: 'Kit Escola/Interclasse', href: '/kits' },
    { label: 'Kit Evento', href: '/kits' },
    { label: 'Kit Corrida', href: '/kits' },
  ],
  help: [
    { label: 'Como Personalizar', href: '/#como-funciona' },
    { label: 'Tabela de Medidas', href: '/sobre#medidas' },
    { label: 'Prazo de Entrega', href: '/sobre#entregas' },
    { label: 'Política de Troca', href: '/sobre#trocas' },
    { label: 'Perguntas Frequentes', href: '/#faq' },
  ],
  account: [
    { label: 'Minha Conta', href: '/conta' },
    { label: 'Meus Pedidos', href: '/pedidos' },
    { label: 'Login / Cadastro', href: '/login' },
    { label: 'Sobre a StreetDrop', href: '/sobre' },
  ],
}

// TikTok icon (Lucide doesn't include it)
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.21a8.16 8.16 0 0 0 4.77 1.52V7.27a4.85 4.85 0 0 1-1-.58z" />
    </svg>
  )
}

export function Footer() {
  const whatsappLink = getWhatsAppLink('Olá! Gostaria de saber mais sobre os produtos da StreetDrop Wear.')

  return (
    <footer className="bg-brand-graphite border-t border-white/8">
      {/* CTA Strip */}
      <div className="bg-brand-red">
        <div className="container-brand py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="heading-display text-2xl text-brand-white">PRECISA DE UM ORÇAMENTO?</p>
            <p className="text-sm text-white/80 mt-0.5">Fale direto com a gente no WhatsApp</p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-black text-brand-white font-semibold text-sm uppercase tracking-wider hover:bg-brand-black transition-colors cursor-pointer group flex-shrink-0"
          >
            <MessageCircle size={18} />
            Falar no WhatsApp
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-brand py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-sdw.svg"
                alt="StreetDrop Wear"
                className="h-14 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="text-sm text-brand-gray-text leading-relaxed mb-5">
              Vista sua identidade. Crie seu drop. Represente seu estilo.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-brand-red transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Instagram @streetdrop_wear"
              >
                <Instagram size={16} className="text-brand-white" />
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#010101] hover:border hover:border-white/20 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="TikTok @streetdropwear"
              >
                <TikTokIcon size={16} />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-[#25D366] transition-colors flex items-center justify-center cursor-pointer"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} className="text-brand-white" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-white mb-4">Loja</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map(link => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-brand-gray-text hover:text-brand-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kits Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-white mb-4">Kits</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.kits.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-brand-gray-text hover:text-brand-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-white mb-4">Ajuda</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.help.map(link => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-brand-gray-text hover:text-brand-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-white mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-brand-gray-text">
                <Mail size={14} className="text-brand-red mt-0.5 flex-shrink-0" />
                <a href={`mailto:${EMAIL}`} className="hover:text-brand-white transition-colors break-all">
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-brand-gray-text">
                <Phone size={14} className="text-brand-red mt-0.5 flex-shrink-0" />
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-brand-white transition-colors">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-brand-gray-text">
                <MapPin size={14} className="text-brand-red mt-0.5 flex-shrink-0" />
                <span>Uberlândia, MG<br />Brasil</span>
              </li>
            </ul>

          </div>
        </div>
      </div>

      {/* Payment & Security Strip */}
      <div className="border-t border-white/5">
        <div className="container-brand py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">

            {/* Payment methods */}
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Formas de Pagamento</p>
              <div className="flex flex-wrap items-center gap-2">
                {/* Visa */}
                <div className="h-8 px-3 bg-[#1A1F71] flex items-center justify-center rounded-sm">
                  <svg viewBox="0 0 60 20" width="38" height="14" aria-label="Visa">
                    <text x="0" y="16" fill="white" fontSize="18" fontFamily="Arial,sans-serif" fontWeight="700" fontStyle="italic" letterSpacing="-0.5">VISA</text>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="h-8 px-2 bg-[#252525] flex items-center justify-center gap-0.5 rounded-sm">
                  <svg viewBox="0 0 38 24" width="38" height="24" aria-label="Mastercard">
                    <circle cx="14" cy="12" r="10" fill="#EB001B" />
                    <circle cx="24" cy="12" r="10" fill="#F79E1B" />
                    <path d="M19 5.35A10 10 0 0 1 24 12a10 10 0 0 1-5 6.65A10 10 0 0 1 14 12a10 10 0 0 1 5-6.65z" fill="#FF5F00" />
                  </svg>
                </div>
                {/* Hipercard */}
                <div className="h-8 px-3 bg-[#B22222] flex items-center justify-center rounded-sm">
                  <svg viewBox="0 0 72 20" width="54" height="14" aria-label="Hipercard">
                    <text x="0" y="15" fill="white" fontSize="13" fontFamily="Arial,sans-serif" fontWeight="700">Hipercard</text>
                  </svg>
                </div>
                {/* Elo */}
                <div className="h-8 px-3 bg-[#F5C518] flex items-center justify-center rounded-sm">
                  <svg viewBox="0 0 36 20" width="30" height="16" aria-label="Elo">
                    <text x="0" y="15" fill="#000" fontSize="15" fontFamily="Arial,sans-serif" fontWeight="900">elo</text>
                  </svg>
                </div>
                {/* Alelo */}
                <div className="h-8 px-3 bg-gradient-to-r from-[#F47920] to-[#2E8B2E] flex items-center justify-center rounded-sm">
                  <svg viewBox="0 0 44 20" width="36" height="14" aria-label="Alelo">
                    <text x="0" y="15" fill="white" fontSize="13" fontFamily="Arial,sans-serif" fontWeight="700">alelo</text>
                  </svg>
                </div>
                {/* Diners Club */}
                <div className="h-8 px-2 bg-[#F0F0F0] flex items-center justify-center rounded-sm">
                  <svg viewBox="0 0 54 28" width="42" height="22" aria-label="Diners Club">
                    <circle cx="18" cy="14" r="12" fill="#004A97" />
                    <circle cx="36" cy="14" r="12" fill="#004A97" />
                    <path d="M27 6.2a12 12 0 0 1 0 15.6A12 12 0 0 1 27 6.2z" fill="#004A97" />
                    <path d="M27 8.5a9 9 0 0 0 0 11A9 9 0 0 0 27 8.5z" fill="#F0F0F0" />
                  </svg>
                </div>
                {/* PIX */}
                <div className="h-8 px-2.5 bg-[#32BCAD] flex items-center justify-center gap-1.5 rounded-sm">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-label="PIX" fill="white">
                    <path d="M8 0L10.83 5.17L16 8L10.83 10.83L8 16L5.17 10.83L0 8L5.17 5.17L8 0Z" />
                  </svg>
                  <span className="text-white text-[11px] font-bold tracking-wide">PIX</span>
                </div>
                {/* Boleto */}
                <div className="h-8 px-3 bg-white flex items-center justify-center gap-1.5 rounded-sm">
                  <svg viewBox="0 0 24 16" width="24" height="16" aria-label="Boleto" fill="#111">
                    <rect x="0" y="0" width="2" height="16" />
                    <rect x="4" y="0" width="1" height="16" />
                    <rect x="7" y="0" width="3" height="16" />
                    <rect x="12" y="0" width="1" height="16" />
                    <rect x="15" y="0" width="2" height="16" />
                    <rect x="19" y="0" width="3" height="16" />
                    <rect x="23" y="0" width="1" height="16" />
                  </svg>
                  <span className="text-[10px] font-bold text-black uppercase tracking-wide">Boleto</span>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Site Seguro</p>
              <div className="flex flex-wrap items-center gap-2">
                {/* SSL */}
                <div className="h-10 px-3 bg-white/5 border border-white/10 flex items-center gap-2 rounded-sm">
                  <svg viewBox="0 0 16 20" width="12" height="15" fill="none" aria-hidden="true">
                    <rect x="1" y="7" width="14" height="12" rx="1.5" fill="#2E8B57" />
                    <path d="M4 7V5a4 4 0 0 1 8 0v2" stroke="#2E8B57" strokeWidth="2" fill="none" />
                    <circle cx="8" cy="13" r="2" fill="white" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-green-400 leading-none uppercase tracking-wide">Site Seguro</p>
                    <p className="text-[8px] text-white/40 leading-none mt-0.5">SSL Certificado</p>
                  </div>
                </div>
                {/* Google Safe */}
                <div className="h-10 px-3 bg-white/5 border border-white/10 flex items-center gap-2 rounded-sm">
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-label="Google">
                    <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.61 4.61 0 0 1-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.31z" fill="#4285F4" />
                    <path d="M10 20c2.7 0 4.96-.9 6.61-2.44l-3.24-2.5c-.9.6-2.05.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H1.1v2.58A10 10 0 0 0 10 20z" fill="#34A853" />
                    <path d="M4.44 11.92A5.98 5.98 0 0 1 4.12 10c0-.67.11-1.32.32-1.92V5.5H1.1A10 10 0 0 0 0 10c0 1.61.38 3.13 1.1 4.5l3.34-2.58z" fill="#FBBC05" />
                    <path d="M10 3.96c1.46 0 2.77.5 3.8 1.49l2.85-2.85A9.96 9.96 0 0 0 10 0 10 10 0 0 0 1.1 5.5l3.34 2.58C5.22 5.71 7.41 3.96 10 3.96z" fill="#EA4335" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-white/80 leading-none">Google</p>
                    <p className="text-[8px] text-white/40 leading-none mt-0.5">Safe Browsing</p>
                  </div>
                </div>
                {/* Compra Segura */}
                <div className="h-10 px-3 bg-white/5 border border-white/10 flex items-center gap-2 rounded-sm">
                  <svg viewBox="0 0 16 20" width="12" height="15" fill="none" aria-hidden="true">
                    <path d="M8 0L1 3v6c0 4.42 2.98 8.56 7 9.93C12.02 17.56 15 13.42 15 9V3L8 0z" fill="#E10600" />
                    <path d="M5 9l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-brand-red leading-none uppercase tracking-wide">Compra</p>
                    <p className="text-[8px] text-white/40 leading-none mt-0.5">100% Segura</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-brand py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-gray-text/60">
          <p>© 2025 StreetDrop Wear. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/sobre#privacidade" className="hover:text-brand-white transition-colors">Privacidade</Link>
            <Link href="/sobre#termos" className="hover:text-brand-white transition-colors">Termos de Uso</Link>
            <Link href="/sobre#cnpj" className="hover:text-brand-white transition-colors">CNPJ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
