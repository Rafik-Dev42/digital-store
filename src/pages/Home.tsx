import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import ProductImage from "@/components/ProductImage";
import { useScrollReveal, useCountUp } from "@/hooks/useScrollReveal";
import { maskEmail, parseStatValue } from "@/lib/format";
import {
  ArrowRight,
  Zap,
  Shield,
  Brain,
  BarChart3,
  Star,
  Download,
  Users,
  Globe,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import gsap from "gsap";

// ─── Particle Canvas (optimized) ─────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const count = isMobile ? 35 : 60;
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.4,
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const animate = () => {
      if (visibleRef.current) {
        const cw = w();
        const ch = h();
        ctx.clearRect(0, 0, cw, ch);

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > cw) p.vx *= -1;
          if (p.y < 0 || p.y > ch) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 85, 0, 0.35)";
          ctx.fill();
        }

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(255, 85, 0, ${0.08 * (1 - dist / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}

// ─── Floating Orbs ─────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="orb orb-1 absolute top-1/4 -left-20 w-72 h-72 bg-[#ff5500]/10 rounded-full blur-[100px]" />
      <div className="orb orb-2 absolute top-1/3 right-0 w-96 h-96 bg-[#ff8c00]/8 rounded-full blur-[120px]" />
      <div className="orb orb-3 absolute bottom-1/4 left-1/3 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px]" />
    </div>
  );
}

// ─── Hero Section ──────────────────────────────────────────────
function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(badgeRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 })
      .fromTo(
        textRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 },
        "-=0.2",
      );
  }, []);

  return (
    <section className="relative min-h-screen flex items-end pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#121418] via-[#1a1d22] to-[#121418] animate-gradient-shift" />
      <ParticleCanvas />
      <FloatingOrbs />
      <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-[#121418]/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ff5500]/10 border border-[#ff5500]/20 rounded-full mb-6 backdrop-blur-sm"
          >
            <Zap className="w-3.5 h-3.5 text-[#ff5500] animate-pulse" />
            <span className="text-[#ff5500] text-xs font-medium">
              The Global Marketplace for Digital Mastery
            </span>
          </div>

          <div ref={textRef}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Premium Digital
              <br />
              <span className="text-gradient animate-shimmer">Assets & Tools</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-xl leading-relaxed">
              Access high-end courses, industry templates, and premium digital assets.
              Trusted by 50,000+ creators worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-[#ff5500] text-white font-medium rounded-lg hover:bg-[#e64d00] transition-all hover:shadow-[0_0_40px_rgba(255,85,0,0.35)] hover:-translate-y-0.5"
              >
                Explore Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:border-[#ff5500] hover:text-[#ff5500] transition-all hover:-translate-y-0.5 backdrop-blur-sm"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow text-white/30">
        <ChevronDown className="w-6 h-6" />
      </div>
    </section>
  );
}

// ─── Trust Marquee ─────────────────────────────────────────────
function TrustMarquee() {
  const brands = ["React", "Figma", "TypeScript", "Next.js", "Tailwind", "Node.js", "Stripe", "AWS"];
  const doubled = [...brands, ...brands];

  return (
    <section className="py-6 bg-[#121418] border-y border-white/5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((brand, i) => (
          <span
            key={i}
            className="mx-8 text-white/20 text-sm font-medium tracking-widest uppercase"
          >
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Stats Section ─────────────────────────────────────────────
function StatCounter({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: typeof Download;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { num, suffix } = parseStatValue(value);
  useCountUp(ref, num, suffix, [value]);

  return (
    <div className="reveal-item text-center group">
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-xl bg-[#ff5500]/10 flex items-center justify-center group-hover:bg-[#ff5500]/20 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-5 h-5 text-[#ff5500]" />
        </div>
      </div>
      <div ref={ref} className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">
        {value}
      </div>
      <div className="text-sm text-white/50">{label}</div>
    </div>
  );
}

function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef, [], { childSelector: ".reveal-item", stagger: 0.15 });

  const stats = [
    { value: "2.4M+", label: "Assets Sold", icon: Download },
    { value: "150+", label: "Countries", icon: Globe },
    { value: "98%", label: "Satisfaction", icon: CheckCircle },
    { value: "50K+", label: "Creators", icon: Users },
  ];

  return (
    <section ref={sectionRef} className="relative py-16 bg-[#121418]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Product Card Skeleton ───────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-[#1a1d22] border border-white/5 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/5 rounded w-1/4" />
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-full" />
      </div>
    </div>
  );
}

// ─── Featured Products ─────────────────────────────────────────
function FeaturedProducts() {
  const { data: featuredProducts, isLoading } = trpc.product.getFeatured.useQuery();
  const sectionRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef, [featuredProducts?.length], {
    childSelector: ".product-card",
    stagger: 0.08,
  });

  return (
    <section ref={sectionRef} className="py-24 bg-[#121418]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 reveal-item">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Featured Products
            </h2>
            <p className="text-white/50">
              Hand-picked premium assets from top creators
            </p>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 text-[#ff5500] text-sm font-medium hover:gap-3 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
            : featuredProducts?.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="product-card group block bg-[#1a1d22] border border-white/5 rounded-xl overflow-hidden hover:border-[#ff5500]/30 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,85,0,0.12)] hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <ProductImage
                      src={product.image}
                      alt={product.title}
                      fileType={product.fileType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#ff5500]/10 text-[#ff5500] text-xs font-medium rounded">
                        {product.fileType}
                      </span>
                      {product.isFeatured && (
                        <span className="px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-2 group-hover:text-[#ff5500] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-white/50 text-sm mb-3 line-clamp-2">
                      {product.shortDesc ?? product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#ff5500] font-bold text-lg">
                        ${product.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-white/60 text-sm">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-[#ff5500] text-sm font-medium"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ──────────────────────────────────────────
function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef, [], { childSelector: ".feature-card", stagger: 0.1 });

  const features = [
    {
      icon: Brain,
      title: "AI-Driven Recommendations",
      desc: "Get personalized product suggestions based on your browsing and purchase history.",
    },
    {
      icon: Zap,
      title: "Instant Global Delivery",
      desc: "Download your purchases immediately after checkout. No waiting, no shipping.",
    },
    {
      icon: Shield,
      title: "Secure Licensing",
      desc: "Every product comes with clear licensing terms. Know exactly what you're buying.",
    },
    {
      icon: BarChart3,
      title: "Creator Analytics",
      desc: "Sellers get detailed analytics on sales, views, and customer demographics.",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-[#1a1d22]/50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff5500]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose NEXUS
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Built for professionals who demand quality, security, and speed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card group p-6 bg-[#121418] border border-white/5 rounded-xl hover:border-[#ff5500]/30 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,85,0,0.08)] hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-[#ff5500]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#ff5500]/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-[#ff5500]" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ──────────────────────────────────────
function TestimonialsSection() {
  const { data: feedbackData, isLoading } = trpc.feedback.list.useQuery({
    page: 1,
    limit: 6,
  });
  const testimonials = feedbackData?.feedback ?? [];
  const sectionRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef, [testimonials.length], {
    childSelector: ".testimonial-card",
    stagger: 0.08,
  });

  return (
    <section ref={sectionRef} className="py-24 bg-[#121418]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Creators Say
          </h2>
          <p className="text-white/50">
            Real feedback from our community of professionals
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 bg-[#1a1d22] border border-white/5 rounded-xl animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="testimonial-card p-6 bg-[#1a1d22] border border-white/5 rounded-xl hover:border-[#ff5500]/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: item.rating ?? 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  &ldquo;{item.message}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#ff5500]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#ff5500] text-xs font-bold">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-white/40 text-xs">{maskEmail(item.email)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Newsletter Section ────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  }, [email]);

  return (
    <section ref={sectionRef} className="py-24 bg-[#1a1d22]/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Join The Pulse
        </h2>
        <p className="text-white/50 mb-8">
          Get weekly updates on new products, exclusive deals, and creator tips.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-green-400 animate-fade-in-up">
            <CheckCircle className="w-5 h-5" />
            <span>Thanks for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#ff5500] transition-colors"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#ff5500] text-white font-medium rounded-lg hover:bg-[#e64d00] transition-all hover:shadow-[0_0_20px_rgba(255,85,0,0.3)]"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

// ─── Home Page ─────────────────────────────────────────────────
export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustMarquee />
      <StatsSection />
      <FeaturedProducts />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
