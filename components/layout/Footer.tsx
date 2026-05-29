import Link from 'next/link'
import Image from 'next/image'
import { Instagram, MessageCircle, Youtube, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

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
              <Image
                src="/logo-sdw.svg"
                alt="StreetDrop Wear"
                width={140}
                height={46}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="text-sm text-brand-gray-text leading-relaxed mb-5">
              Vista sua identidade. Crie seu drop. Represente seu estilo.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/streetdropwear"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-brand-red transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram size={16} className="text-brand-white" />
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
              <a
                href="https://youtube.com/@streetdropwear"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="YouTube"
              >
                <Youtube size={16} className="text-brand-white" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-white mb-4">Loja</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map(link => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-text hover:text-brand-white transition-colors"
                  >
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
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-text hover:text-brand-white transition-colors"
                  >
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
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-text hover:text-brand-white transition-colors"
                  >
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
                <a href="mailto:contato@streetdropwear.com" className="hover:text-brand-white transition-colors">
                  contato@streetdropwear.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-brand-gray-text">
                <Phone size={14} className="text-brand-red mt-0.5 flex-shrink-0" />
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-brand-white transition-colors">
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-brand-gray-text">
                <MapPin size={14} className="text-brand-red mt-0.5 flex-shrink-0" />
                <span>São Paulo, SP<br />Brasil</span>
              </li>
            </ul>

            <div className="mt-5">
              <p className="text-xs text-brand-gray-text/60 uppercase tracking-wider mb-2">Pagamento</p>
              <div className="flex flex-wrap gap-1.5">
                {['PIX', 'Visa', 'Master', 'Elo', 'Boleto'].map(method => (
                  <span
                    key={method}
                    className="px-2 py-1 bg-white/5 text-[10px] text-brand-gray-text uppercase tracking-wider"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-brand py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-gray-text/60">
          <p>© 2024 StreetDrop Wear. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/sobre#privacidade" className="hover:text-brand-white transition-colors">
              Privacidade
            </Link>
            <Link href="/sobre#termos" className="hover:text-brand-white transition-colors">
              Termos de Uso
            </Link>
            <Link href="/sobre#cnpj" className="hover:text-brand-white transition-colors">
              CNPJ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
