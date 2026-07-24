import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="bg-brand-500 p-1.5 rounded-md text-white transition-transform group-hover:scale-105">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Cloudwarden</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Autonomous cloud cost control for modern engineering teams. Build your policies in code, execute with safety.
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Cloudwarden Inc. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#platform" className="hover:text-brand-500 transition-colors">Platform</Link></li>
              <li><Link href="#capabilities" className="hover:text-brand-500 transition-colors">Capabilities</Link></li>
              <li><Link href="#how-it-works" className="hover:text-brand-500 transition-colors">How it works</Link></li>
              <li><Link href="#outcomes" className="hover:text-brand-500 transition-colors">Outcomes</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Trust & Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-brand-500 transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-brand-500 transition-colors">Audit trail</Link></li>
              <li><Link href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
              <li><a href="mailto:contact@iprudhvi.in" className="hover:text-brand-500 transition-colors">Email us</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
