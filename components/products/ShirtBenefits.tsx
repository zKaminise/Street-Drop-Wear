import Image from 'next/image'

type Feature = { title: string; body: string }

type BenefitsContent = {
  tag: string
  headline: string
  intro: string
  features: [Feature, Feature, Feature]
}

// ── Content per type/gender ────────────────────────────────────────────────────

const CONTENT: Record<string, BenefitsContent> = {
  oversized: {
    tag: 'por que criamos isso',
    headline: 'Estilo urbano com a leveza e qualidade de peças premium',
    intro: 'Desfrute do máximo conforto e estilo com nossas Camisetas Oversized Premium. Com versatilidade e respirabilidade, essas peças adicionam personalidade e facilidade ao seu guarda-roupa. Atualize seu visual com uma opção atual e cheia de estilo.',
    features: [
      {
        title: 'Conforto Premium',
        body: 'Toque macio, respirabilidade e leve elasticidade. O tecido garante liberdade de movimento e evita encolhimento mesmo após várias lavagens.',
      },
      {
        title: 'Corte Oversized Autêntico',
        body: 'Caimento amplo e estruturado com ombros deslocados e mangas amplas. Design pensado para unir estilo urbano e conforto, ideal para o dia a dia ou pós-treino.',
      },
      {
        title: 'Versatilidade no Dia a Dia',
        body: 'Funciona em qualquer ocasião — do treino ao casual. Combina com bermudas, calças ou jaquetas, entregando equilíbrio entre conforto e estilo em todas as situações.',
      },
    ],
  },

  camiseta: {
    tag: 'por que criamos isso',
    headline: 'Algodão pima peruano + malha interlock, a fibra mais nobre.',
    intro: 'Camiseta confeccionada em algodão Pima peruano de fibra longa, reconhecido pela maciez excepcional e durabilidade superior. O tecido respirável oferece conforto durante o dia inteiro, mantendo a forma e a cor mesmo após múltiplas lavagens.',
    features: [
      {
        title: 'DNA Peruano',
        body: 'Cultivado há milênios nos Andes. Apenas 1% do algodão mundial tem essa nobreza. Processo artesanal que preserva a integridade e o brilho natural da fibra.',
      },
      {
        title: 'Sistema Interlock',
        body: 'Malha de construção dupla. Mais densidade, mais estrutura, zero flacidez no tecido. Fibras Extra Longas que garantem resistência à tração 50% superior ao algodão comum.',
      },
      {
        title: 'Caimento Estruturado',
        body: 'A malha dupla desenha o corpo sem marcar e sem ficar transparente. Tecnologia anti-torção: a costura lateral permanece no lugar após a lavagem.',
      },
    ],
  },

  dryfit_masculino: {
    tag: 'por que criamos isso',
    headline: 'Minimalista, projetada para movimento e uso diário.',
    intro: 'Experimente o conforto e desempenho de alto nível das nossas Camisetas Dry Fit. Feitas com tecido dryfit de alta performance, oferecem respirabilidade e regulação de temperatura para atletas e esportistas. Garanta seu melhor rendimento.',
    features: [
      {
        title: 'Tecnologia Anti-suor',
        body: 'A tecnologia anti-suor com secagem rápida mantém sua pele sempre seca e confortável, mesmo nos treinos mais intensos. O tecido dry fit permite que o suor evapore rapidamente, garantindo leveza e alta performance.',
      },
      {
        title: 'Elasticidade Multidirecional',
        body: 'Com a composição ideal de fibras e elastano, a camiseta proporciona elasticidade em todas as direções, acompanhando cada movimento natural do corpo sem restringir a performance.',
      },
      {
        title: 'Respirabilidade Inteligente',
        body: 'O tecido dry fit foi desenvolvido para permitir a circulação eficiente do ar, mantendo o corpo fresco e seco. A respirabilidade inteligente ajuda a regular a temperatura durante treinos de alta intensidade.',
      },
    ],
  },

  dryfit_feminino: {
    tag: 'por que criamos isso',
    headline: 'Minimalista, projetada para movimento e uso diário.',
    intro: 'A Camiseta Feminina Dry Fit combina conforto excepcional com alta performance, ideal para acompanhar seus movimentos com liberdade e leveza. Seu tecido tecnológico garante ventilação e secagem rápida, mantendo o corpo fresco durante atividades intensas.',
    features: [
      {
        title: 'Tecnologia Anti-suor',
        body: 'A tecnologia anti-suor com secagem rápida mantém sua pele sempre seca e confortável, mesmo nos treinos mais intensos. O tecido dry fit permite que o suor evapore rapidamente, garantindo leveza e alta performance.',
      },
      {
        title: 'Elasticidade Multidirecional',
        body: 'Com a composição ideal de fibras e elastano, a camiseta proporciona elasticidade em todas as direções, acompanhando cada movimento natural do corpo sem restringir a performance.',
      },
      {
        title: 'Respirabilidade Inteligente',
        body: 'O tecido dry fit foi desenvolvido para permitir a circulação eficiente do ar, mantendo o corpo fresco e seco. A respirabilidade inteligente ajuda a regular a temperatura durante treinos de alta intensidade.',
      },
    ],
  },
}

// ── Image placeholder ─────────────────────────────────────────────────────────

function ImgPlaceholder({ label, aspect = 'square' }: { label: string; aspect?: 'square' | 'portrait' }) {
  return (
    <div
      className={`w-full relative bg-[#1A1A1A] flex items-center justify-center overflow-hidden rounded-lg ${aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'}`}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <span className="text-[10px] text-white/15 uppercase tracking-widest select-none relative z-10">
        {label}
      </span>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ShirtBenefitsProps {
  type: 'oversized' | 'camiseta' | 'dryfit'
  gender?: string
  heroImageUrl?: string
  gallery1Url?: string
  gallery2Url?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ShirtBenefits({
  type,
  gender = 'UNISEX',
  heroImageUrl,
  gallery1Url,
  gallery2Url,
}: ShirtBenefitsProps) {
  const key =
    type === 'dryfit'
      ? gender === 'FEMININO'
        ? 'dryfit_feminino'
        : 'dryfit_masculino'
      : type

  const c = CONTENT[key]
  if (!c) return null

  return (
    <section className="bg-white text-[#0B0B0D] mt-10">
      {/* ── Top row: tag / headline / intro | hero image ── */}
      <div className="container-brand">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10">
          {/* Text */}
          <div className="flex flex-col justify-center py-14 pr-0 md:pr-16">
            <span className="text-xs text-[#6B6B6B] uppercase tracking-[0.2em] mb-4">{c.tag}</span>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-black text-[#0B0B0D] leading-tight mb-6">
              {c.headline}
            </h2>
            <p className="text-sm text-[#4A4A4A] leading-relaxed max-w-md">{c.intro}</p>
          </div>

          {/* Hero image */}
          <div className="md:pl-0 mt-10">
            {heroImageUrl ? (
              <div className="w-full h-full relative min-h-[320px] rounded-lg overflow-hidden">
                <Image src={heroImageUrl} alt="Produto" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <ImgPlaceholder label="Foto principal" aspect="portrait" />
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row: features | gallery ── */}
      <div className="container-brand">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 py-14">
          {/* Features list */}
          <div className="pr-0 md:pr-16">
            <h3 className="text-base font-black uppercase tracking-widest text-[#0B0B0D] mb-6 pb-4 border-b border-black/10 flex items-center justify-between">
              Características
              <span className="text-lg font-light text-[#0B0B0D]/30">—</span>
            </h3>
            <div className="space-y-6">
              {c.features.map((f, i) => (
                <div key={i}>
                  <p className="text-sm font-bold text-[#0B0B0D] mb-1">{f.title}</p>
                  <p className="text-sm text-[#5A5A5A] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery: 2 images side by side */}
          <div className="flex gap-3 items-start mt-4 md:mt-0">
            <div className="flex-1">
              {gallery1Url ? (
                <div className="w-full aspect-[3/4] relative overflow-hidden rounded-lg">
                  <Image src={gallery1Url} alt="Produto 1" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <ImgPlaceholder label="Foto 1" aspect="portrait" />
              )}
            </div>
            <div className="flex-1">
              {gallery2Url ? (
                <div className="w-full aspect-[3/4] relative overflow-hidden rounded-lg">
                  <Image src={gallery2Url} alt="Produto 2" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <ImgPlaceholder label="Foto 2" aspect="portrait" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
