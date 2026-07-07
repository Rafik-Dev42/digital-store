import { Link } from "react-router";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1d22] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#ff5500] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-white font-semibold text-lg">NEXUS</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              The premier marketplace for digital products. Quality assets for creators, developers, and innovators.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Categories</h4>
            <ul className="space-y-2">
              {[
                { label: "E-Books", slug: "ebooks" },
                { label: "Online Courses", slug: "courses" },
                { label: "Templates", slug: "templates" },
                { label: "Software", slug: "software" },
                { label: "Graphics", slug: "graphics" },
                { label: "Audio", slug: "audio" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="text-white/50 text-sm hover:text-[#ff5500] transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                { label: "Help Center", to: "/contact" },
                { label: "Community", to: "/community" },
                { label: "Reviews", to: "/feedback" },
                { label: "Contact Us", to: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-white/50 text-sm hover:text-[#ff5500] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Terms of Service", "Privacy Policy", "License Agreement", "Refund Policy"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-white/50 text-sm">{item}</span>
                  </li>
                )
              )}
            </ul>
            <div className="flex gap-3 mt-4">
              {[Github, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 bg-white/5 rounded flex items-center justify-center hover:bg-[#ff5500] transition-colors"
                >
                  <Icon className="w-4 h-4 text-white/60" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} NEXUS Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
